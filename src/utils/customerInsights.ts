function cleanStr(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'unknown' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined'
  ) {
    return null;
  }
  return trimmed;
}

// Groups merged orders by customer identity, flags "recurring buyer" when the
// same product was bought in 2+ different calendar months.
// Supports both B2C store customer orders and B2B wholesale / home business orders.
export function buildCustomerInsights(
  orders: any[],
  storeNameByOwnerId: Record<string, string> = {},
) {
  const byCustomer: Record<string, any> = {};

  for (const o of orders || []) {
    const buyerId = cleanStr(o.customerId) || cleanStr(o.buyerId) || cleanStr(o.userId) || null;
    const phone =
      cleanStr(o.customerPhone) ||
      cleanStr(o.shippingAddress?.phone) ||
      cleanStr(o.user?.phone) ||
      cleanStr(o.phone) ||
      null;
    const email =
      cleanStr(o.customerEmail) ||
      cleanStr(o.contactEmail) ||
      cleanStr(o.user?.email) ||
      cleanStr(o.email) ||
      null;

    // Stable grouping key: buyerId > phone > email > order _id
    const key = buyerId || phone || email || cleanStr(o.customerName) || o._id || 'guest';

    const storeName =
      cleanStr(buyerId ? storeNameByOwnerId?.[buyerId] : null) ||
      cleanStr(o.buyerId ? storeNameByOwnerId?.[o.buyerId] : null) ||
      cleanStr(o.userId ? storeNameByOwnerId?.[o.userId] : null) ||
      cleanStr(o.storeName) ||
      null;

    const contactName =
      cleanStr(o.shippingAddress?.fullName) ||
      cleanStr(
        o.shippingAddress?.firstName
          ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ''}`.trim()
          : null,
      ) ||
      cleanStr(o.customerName) ||
      cleanStr(o.user?.name) ||
      cleanStr(o.buyerName) ||
      null;

    const address = cleanStr(
      o.shippingAddress?.city
        ? [o.shippingAddress.addressLine1, o.shippingAddress.city].filter(Boolean).join(', ')
        : o.shippingAddress?.addressLine1 || null,
    );

    const displayName =
      storeName ||
      contactName ||
      (phone ? (phone.startsWith('+') ? phone : `+91 ${phone}`) : null) ||
      email ||
      (buyerId ? `Buyer #${buyerId.slice(-6).toUpperCase()}` : null);

    if (!byCustomer[key]) {
      byCustomer[key] = {
        key,
        name: displayName,
        storeName,
        contactName,
        phone,
        email,
        address,
        customerId: buyerId,
        orders: [] as any[],
      };
    } else {
      const cur = byCustomer[key];
      if (!cur.storeName && storeName) cur.storeName = storeName;
      if (!cur.contactName && contactName) cur.contactName = contactName;
      if (!cur.name || cur.name.toLowerCase() === 'unknown') {
        cur.name = storeName || contactName || cur.name;
      }
      if (!cur.phone && phone) cur.phone = phone;
      if (!cur.email && email) cur.email = email;
      if (!cur.address && address) cur.address = address;
      if (!cur.customerId && buyerId) cur.customerId = buyerId;
    }
    byCustomer[key].orders.push(o);
  }

  return Object.values(byCustomer)
    .map((c: any) => {
      const totalOrders = c.orders.length;
      const totalSpent = c.orders.reduce(
        (s: number, o: any) => s + (Number(o.totalAmount) || Number(o.amount) || 0),
        0,
      );
      const lastOrderDate = c.orders.reduce(
        (latest: string, o: any) =>
          !latest || new Date(o.createdAt) > new Date(latest) ? o.createdAt : latest,
        '',
      );

      const productMonths: Record<string, Set<string>> = {};
      for (const o of c.orders) {
        const month = (o.createdAt || '').slice(0, 7);
        const titles: string[] =
          o._source === 'smartOrder' && o.rawItems?.length
            ? o.rawItems.map((it: any) => it.title)
            : o.items?.length
            ? o.items.map((it: any) => it.title || it.name)
            : [o.offerTitle || o.productTitle || 'Item'];
        for (const t of titles) {
          if (!t) continue;
          if (!productMonths[t]) productMonths[t] = new Set();
          productMonths[t].add(month);
        }
      }

      const recurringProducts = Object.entries(productMonths)
        .filter(([, months]) => months.size >= 2)
        .map(([title, months]) => ({ title, monthCount: months.size }))
        .sort((a, b) => b.monthCount - a.monthCount);

      return {
        ...c,
        totalOrders,
        totalSpent,
        lastOrderDate,
        recurringProducts,
        isRecurring: recurringProducts.length > 0 || totalOrders >= 3,
      };
    })
    .sort((a: any, b: any) => b.totalOrders - a.totalOrders);
}