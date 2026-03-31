export const getDiscountMap = (cartItems, appliedIds = [], totalDiscount = 0) => {
  const appliedSet = new Set(appliedIds.map(Number));
  const appliedItems = cartItems.filter(item =>
    appliedSet.has(Number(item.id))
  );

  const total = appliedItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const map = {};

  appliedItems.forEach(item => {
    const itemTotal = item.product.price * item.quantity;

    map[item.id] = total > 0
      ? Math.round((itemTotal / total) * totalDiscount)
      : 0;
  });

  return map;
};


export const getSubtotal = (cartItems) => {
  return cartItems.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);
};


export const getFinalTotal = (subtotal, discount) => {
  return subtotal - discount;
};