import {getProduct, loadProducts} from '../data/products.js';
import {formatCurrency} from './utils/money.js';
import {getDeliveryOption} from '../data/deliveryOptions.js';
import { addToCart } from '../data/cart.js';

function updateCartQuantity(){
  const stored = localStorage.getItem('cart');
  const cartItems = stored ? JSON.parse(stored) : [];
  const cartQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartElement = document.querySelector('.js-cart-quantity');
  if (cartElement) cartElement.innerHTML = cartQuantity;
}

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  const ordersGrid = document.querySelector('.orders-grid');
  if (!ordersGrid) return;

  if (orders.length === 0) {
    ordersGrid.innerHTML = `<div class="order-container">No orders yet.</div>`;
    return;
  }

  const html = orders.map((order) => {
    const itemsHtml = order.cart.map((item) => {
      const product = getProduct(item.productId);
      if (!product) return '';
      const delivery = getDeliveryOption(item.deliveryOptionId);
      const deliveryDate = new Date(order.createdAtMs);
      deliveryDate.setDate(deliveryDate.getDate() + delivery.deliveryDays);
      const deliveryString = deliveryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      // Build URL relative to current page so it works in subfolders (e.g., GitHub Pages repo path)
      const url = new URL('tracking.html', window.location.href);
      url.searchParams.set('orderId', order.orderId);
      url.searchParams.set('productId', item.productId);

      return `
        <div class="product-image-container">
          <img src="${product.image}">
        </div>
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          <div class="product-delivery-date">Arriving on: ${deliveryString}</div>
          <div class="product-quantity">Quantity: ${item.quantity}</div>
          <button class="buy-again-button button-primary js-buy-again" data-product-id="${item.productId}">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>
        <div class="product-actions">
          <a class="js-track-link" href="${url.toString()}" data-order-id="${order.orderId}" data-product-id="${item.productId}">
            <button class="track-package-button button-secondary">
              Track package
            </button>
          </a>
        </div>
      `;
    }).join('');

    const totalDisplay = `$${formatCurrency(order.totalCents)}`;

    return `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${order.orderDate}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>${totalDisplay}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.orderId}</div>
          </div>
        </div>

        <div class="order-details-grid">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join('');

  ordersGrid.innerHTML = html;

  // Bind Buy it again buttons
  ordersGrid.querySelectorAll('.js-buy-again').forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id');
      if (!productId) return;

      // Add to cart
      addToCart(productId);
      updateCartQuantity();

      // Temporary "Added" indicator
      const parent = btn.parentElement;
      if (!parent) return;

      // Clear any previous timeout
      if (btn.dataset.addedTimeoutId) {
        clearTimeout(Number(btn.dataset.addedTimeoutId));
        btn.dataset.addedTimeoutId = '';
      }

      btn.style.display = 'none';
      const addedEl = document.createElement('div');
      addedEl.className = 'added-to-cart';
      addedEl.innerHTML = `<img src="images/icons/checkmark.png"> Added`;
      parent.insertBefore(addedEl, btn);

      const timeoutId = window.setTimeout(() => {
        addedEl.remove();
        btn.style.display = '';
        btn.dataset.addedTimeoutId = '';
      }, 2200);
      btn.dataset.addedTimeoutId = String(timeoutId);
    });
  });
}

loadProducts(() => {
  updateCartQuantity();
  renderOrders();
}); 