import { products, loadProductsFetch, getProduct } from '../data/products.js';
import { addToCart } from '../data/cart.js';
import { formatCurrency } from './utils/money.js';

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function pickRecommendations(currentId, count = 6) {
  const base = products.filter(p => p.id !== currentId);
  return base.slice(0, count);
}

function renderProduct(product) {
  const container = document.querySelector('.js-product');
  if (!container) return;

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-media">
        <img class="product-image-large" src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h1 class="product-title">${product.name}</h1>
        <div class="product-rating">
          <img class="product-rating-stars" src="${product.getStarsUrl()}">
          <span class="product-rating-count">${product.rating.count}</span>
        </div>
        <div class="product-price">${product.getPrice()}</div>
        ${product.extraInfoHTML ? product.extraInfoHTML() : ''}
        <div class="product-quantity-action">
          <label>Qty</label>
          <select class="js-detail-qty">
            ${Array.from({length:10}, (_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}
          </select>
          <button class="button-primary add-to-cart-detail js-add-detail">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  const addBtn = container.querySelector('.js-add-detail');
  const qtyEl = container.querySelector('.js-detail-qty');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = Math.max(1, Number(qtyEl && qtyEl.value) || 1);
      addToCart(product.id, qty);
      // small feedback
      addBtn.textContent = 'Added';
      setTimeout(()=> addBtn.textContent = 'Add to Cart', 1200);
      // update header count via trackingCartCount.js event listener if any
      document.dispatchEvent(new CustomEvent('cart:updated'));
    });
  }
}

function renderRecommendations(currentId) {
  const grid = document.querySelector('.js-recommendations');
  if (!grid) return;
  const recs = pickRecommendations(currentId, 6);
  grid.innerHTML = recs.map(p => `
    <a href="product.html?id=${p.id}" class="rec-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="rec-title limit-text-to-2-lines">${p.name}</div>
      <div class="rec-price">$${formatCurrency(p.priceCents)}</div>
    </a>
  `).join('');
}

async function init() {
  const id = getQueryId();
  if (!id) {
    // Fallback: go home
    window.location.replace('index.html');
    return;
  }
  if (!Array.isArray(products) || products.length === 0) {
    await loadProductsFetch();
  }
  const product = getProduct(id);
  if (!product) {
    window.location.replace('index.html');
    return;
  }
  renderProduct(product);
  renderRecommendations(id);
}

document.addEventListener('DOMContentLoaded', init);
