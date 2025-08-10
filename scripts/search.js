import { products, loadProductsFetch } from '../data/products.js';
import { addToCart, cart } from '../data/cart.js';

function getQuery() {
  const url = new URL(window.location.href);
  return (url.searchParams.get('q') || '').trim();
}

function setSearchBarValue(q) {
  const input = document.querySelector('.search-bar');
  if (input) input.value = q;
}

function filterProducts(list, query) {
  const q = query.toLowerCase();
  return list.filter((product) => {
    const name = (product.name || '').toLowerCase();
    const kw = product.keywords;
    const keywordsStr = Array.isArray(kw) ? kw.join(' ').toLowerCase() : String(kw || '').toLowerCase();
    return name.includes(q) || keywordsStr.includes(q);
  });
}

function updateCartQuantity() {
  const el = document.querySelector('.js-cart-quantity');
  if (!el) return;
  let qty = 0;
  cart.forEach((i) => { qty += Number(i.quantity) || 0; });
  el.textContent = String(qty);
}

function productCardHTML(product) {
  return `
    <div class="product-container" id="product-${product.id}">
      <a class="product-image-container" href="product.html?id=${product.id}">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </a>

      <a class="product-name limit-text-to-2-lines" href="product.html?id=${product.id}">
        ${product.name}
      </a>

      <div class="product-rating-container">
        <img class="product-rating-stars" src="${product.getStarsUrl()}">
        <div class="product-rating-count link-primary">${product.rating.count}</div>
      </div>

      <div class="product-price">${product.getPrice()}</div>

      <div class="product-quantity-container">
        <select>
          <option selected value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      ${product.extraInfoHTML()}

      <div class="product-spacer"></div>

      <div class="added-to-cart">
        <img src="images/icons/checkmark.png">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-card" data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `;
}

function wireAddToCart(container) {
  container.querySelectorAll('.js-add-to-card').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const card = button.closest('.product-container');
      const qtyEl = card ? card.querySelector('.product-quantity-container select') : null;
      const qty = Math.max(1, Number(qtyEl && qtyEl.value) || 1);
      addToCart(productId, qty);
      updateCartQuantity();

      const addedEl = card && card.querySelector('.added-to-cart');
      if (addedEl) {
        if (button.dataset.addedTimeoutId) {
          clearTimeout(Number(button.dataset.addedTimeoutId));
        }
        addedEl.style.opacity = '1';
        const timeoutId = setTimeout(() => {
          addedEl.style.opacity = '0';
          button.dataset.addedTimeoutId = '';
        }, 2000);
        button.dataset.addedTimeoutId = String(timeoutId);
      }
    });
  });
}

async function renderResults() {
  const q = getQuery();
  setSearchBarValue(q);
  const grid = document.querySelector('.js-results-grid');
  if (!grid) return;

  await loadProductsFetch();
  const matches = q ? filterProducts(products, q) : products;

  if (!matches.length) {
    grid.innerHTML = `<div style="padding:16px;">No products found for "${q}"</div>`;
    return;
  }

  grid.innerHTML = matches.map(productCardHTML).join('');
  wireAddToCart(grid);
  updateCartQuantity();
}

document.addEventListener('DOMContentLoaded', () => {
  renderResults();
});
