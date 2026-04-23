const WISHLIST_KEY = "ff_wishlist_items";

export function getWishlistItems() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
}

export function setWishlistItems(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

export function isWishlisted(productId) {
  return getWishlistItems().some((item) => item.productId === productId);
}

export function toggleWishlistItem(item) {
  const items = getWishlistItems();
  const exists = items.some((entry) => entry.productId === item.productId);
  const next = exists ? items.filter((entry) => entry.productId !== item.productId) : [item, ...items];
  setWishlistItems(next);
  return { items: next, added: !exists };
}

export function removeWishlistItem(productId) {
  const next = getWishlistItems().filter((item) => item.productId !== productId);
  setWishlistItems(next);
  return next;
}
