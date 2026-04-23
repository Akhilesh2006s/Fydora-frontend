const CART_KEY = "ff_cart_items";

export function getCartItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

export function setCartItems(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addCartItem(item) {
  const items = getCartItems();
  const existingIndex = items.findIndex(
    (entry) => entry.productId === item.productId && entry.size === item.size && entry.color === item.color
  );

  if (existingIndex >= 0) {
    items[existingIndex].qty += item.qty;
  } else {
    items.push(item);
  }

  setCartItems(items);
  return items;
}
