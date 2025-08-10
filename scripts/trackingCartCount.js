// Updates all elements with .js-cart-quantity to show current cart item count
(function () {
  const CART_KEY = 'cart';

  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function computeCartCount(cart) {
    // Sum only active cart items by quantity
    return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  function renderCount() {
    const cart = readCart();
    const count = computeCartCount(cart);
    document.querySelectorAll('.js-cart-quantity').forEach((el) => {
      el.textContent = String(count);
    });
  }

  // Initialize on load
  renderCount();

  // Listen for same-tab updates dispatched by data/cart.js
  window.addEventListener('cart:updated', renderCount);

  // Listen for cross-tab updates (or changes by other scripts)
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) renderCount();
  });
})(); 