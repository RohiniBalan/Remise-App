/**
 * Notification filter utility for role-based offer notification visibility:
 * - When a home business publishes/creates a common offer: notifications should send for store owners and for users.
 *   It shouldn't send for wholesalers.
 * - When a wholesaler publishes/creates a common offer: notifications should send ONLY for store owners.
 */

export interface NotificationLike {
  type?: string;
  url?: string;
  offerId?: string;
  targetRole?: string | null;
  body?: string;
  isRead?: boolean;
  read?: boolean;
  [key: string]: any;
}

export function isOfferNotificationAllowed(
  item: NotificationLike | null | undefined,
  userRole?: string | null
): boolean {
  if (!item) return false;

  const url = (item.url || '').toLowerCase();
  const type = (item.type || '').toLowerCase();

  const isOffer =
    type === 'offer' ||
    Boolean(item.offerId) ||
    url.includes('offer') ||
    url.includes('/nearby') ||
    url.includes('/my-offers');

  // If not an offer notification (e.g. order, credit, delivery, system), always allow
  if (!isOffer) {
    return true;
  }

  // Private direct offers specifically targeted to a customer
  const isPrivateOffer = Boolean(item.body && item.body.toLowerCase().includes('just for you'));

  const role = (userRole || 'user').toLowerCase();
  const isWholesaler = role === 'wholesaler' || role === 'whole_saler';
  const isStoreOwner = role === 'store_owner';

  // Rule 1: Wholesalers must NOT receive/see common offer notifications
  if (isWholesaler) {
    if (isPrivateOffer) return true;
    return false;
  }

  // Rule 2: When wholesaler published/created a common offer, notifications should send ONLY for store owner
  const isWholesalerOffer =
    item.targetRole === 'store_owner' &&
    url.includes('/my-offers');

  if (isWholesalerOffer) {
    return isStoreOwner;
  }

  // Rule 3: Home business common offers go to store owners and users
  return true;
}
