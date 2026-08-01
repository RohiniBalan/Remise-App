// Ported verbatim from client/app/store/dashboard/page.tsx's buildCustomerInsights.
// Groups merged orders by customer identity, flags "recurring buyer" when the
// same product was bought in 2+ different calendar months.
export function buildCustomerInsights(orders: any[]) {
  const byCustomer: Record<string, any> = {};

  for (const o of orders) {
    const key = o.customerId || o.userId || o.customerPhone || o.customerEmail || o.customerName || o._id;
    if (!byCustomer[key]) {
      byCustomer[key] = {
        key,
        name: o.customerName || 'Unknown',
        phone: o.customerPhone || null,
        email: o.customerEmail || null,
        customerId: o.customerId || o.userId || null,
        orders: [] as any[],
      };
    }
    byCustomer[key].orders.push(o);
  }

  return Object.values(byCustomer)
    .map((c: any) => {
      const totalOrders = c.orders.length;
      const totalSpent = c.orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
      const lastOrderDate = c.orders.reduce(
        (latest: string, o: any) => (!latest || new Date(o.createdAt) > new Date(latest) ? o.createdAt : latest),
        '',
      );

      const productMonths: Record<string, Set<string>> = {};
      for (const o of c.orders) {
        const month = (o.createdAt || '').slice(0, 7);
        const titles: string[] =
          o._source === 'smartOrder' && o.rawItems?.length ? o.rawItems.map((it: any) => it.title) : [o.offerTitle];
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

      return { ...c, totalOrders, totalSpent, lastOrderDate, recurringProducts, isRecurring: recurringProducts.length > 0 };
    })
    .sort((a: any, b: any) => b.totalOrders - a.totalOrders);
}