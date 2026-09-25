/**
 * Helper to check if an order record represents a real, completed/placed order
 * rather than an abandoned or cancelled checkout payment attempt.
 */
export const isValidPlacedOrder = (order: any): boolean => {
  if (!order) return false;

  const paymentStatus = (order.paymentStatus || '').toUpperCase();
  const paymentMethod = (order.paymentMethod || '').toLowerCase();
  const refundStatus = (order.refundStatus || '').toLowerCase();

  // Completed or refunded payment
  const isRefunded =
    paymentStatus === 'REFUNDED' ||
    (refundStatus !== '' && refundStatus !== 'none');
  const isPaid =
    paymentStatus === 'SUCCESS' ||
    paymentStatus === 'PAID' ||
    paymentStatus === 'COMPLETED';

  if (isPaid || isRefunded) {
    return true;
  }

  // Cash On Delivery / Cash
  if (
    paymentMethod === 'cod' ||
    paymentMethod === 'cash' ||
    paymentMethod === 'cash_on_delivery'
  ) {
    return paymentStatus !== 'FAILED' && paymentStatus !== 'CANCELLED';
  }

  // QR Code payment
  if (paymentMethod === 'qr' || paymentMethod === 'qr_code') {
    return paymentStatus !== 'FAILED' && paymentStatus !== 'CANCELLED';
  }

  // Online / unspecified payment method with pending/failed status is an abandoned attempt
  return false;
};
