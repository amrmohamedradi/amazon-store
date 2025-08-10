import { getProduct, loadProductsFetch } from '../data/products.js';
import { getDeliveryOption } from '../data/deliveryOptions.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function renderTrackingPage() {
  const orderId = getQueryParam('orderId');
  const productId = getQueryParam('productId');
  if (!orderId || !productId) {
    window.location.href = 'orders.html';
    return;
  }

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.orderId === orderId);
  if (!order) {
    window.location.href = 'orders.html';
    return;
  }

  const item = order.cart.find(ci => ci.productId === productId);
  if (!item) {
    window.location.href = 'orders.html';
    return;
  }

  await loadProductsFetch();
  const product = getProduct(productId);
  if (!product) {
    window.location.href = 'orders.html';
    return;
  }

  const deliveryOption = getDeliveryOption(item.deliveryOptionId);
  const deliveryDate = new Date(order.createdAtMs);
  deliveryDate.setDate(deliveryDate.getDate() + (deliveryOption?.deliveryDays || 0));
  const deliveryString = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // Populate DOM
  const dateEl = document.querySelector('.delivery-date');
  const productNameEl = document.querySelectorAll('.product-info')[0];
  const qtyEl = document.querySelectorAll('.product-info')[1];
  const imgEl = document.querySelector('.product-image');

  if (dateEl) dateEl.textContent = `Arriving on ${deliveryString}`;
  if (productNameEl) productNameEl.textContent = product.name;
  if (qtyEl) qtyEl.textContent = `Quantity: ${item.quantity}`;
  if (imgEl) imgEl.src = product.image;

  // Simple progress bar/state: Preparing/Shipped/Delivered based on days until delivery
  const today = new Date();
  const daysLeft = Math.ceil((deliveryDate - today) / (1000*60*60*24));
  const labels = document.querySelectorAll('.progress-label');
  labels.forEach(l => l.classList.remove('current-status'));
  if (daysLeft > 1 && labels[0]) labels[0].classList.add('current-status');
  else if (daysLeft === 1 && labels[1]) labels[1].classList.add('current-status');
  else if (daysLeft <= 0 && labels[2]) labels[2].classList.add('current-status');

  const bar = document.querySelector('.progress-bar');
  if (bar) {
    const totalDays = Math.max(deliveryOption?.deliveryDays || 1, 1);
    const progressed = Math.min(Math.max(totalDays - Math.max(daysLeft, 0), 0) / totalDays, 1);
    bar.style.width = `${Math.round(progressed * 100)}%`;
  }
}

renderTrackingPage(); 