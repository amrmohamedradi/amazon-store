import{cart,addToCart} from '../data/cart.js';
import{products,loadProducts} from '../data/products.js';
import{formatCurrency} from './utils/money.js';


loadProducts(renderProductHTML);


function renderProductHTML(){
    let productHTML = '';

    products.forEach((product) => {
      productHTML += `
            <div class="product-container" id="product-${product.id}">
              <a class="product-image-container" href="product.html?id=${product.id}">
                <img class="product-image"
                  src="${product.image}">
              </a>

              <a class="product-name limit-text-to-2-lines" href="product.html?id=${product.id}">
                ${product.name}
              </a>

              <div class="product-rating-container">
                <img class="product-rating-stars"
                  src="${product.getStarsUrl()}">
                <div class="product-rating-count link-primary">
                  ${product.rating.count}
                </div>
              </div>

              <div class="product-price">
                ${product.getPrice()}
              </div>

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

              <button class="add-to-cart-button button-primary js-add-to-card"
              data-product-id = "${product.id}">
                Add to Cart
              </button>
            </div>
    `;

    });

    document.querySelector('.js-product-grid').innerHTML = productHTML


    function updateCartQuantity(){
        let cartQuantity=0;
        cart.forEach((cartItem)=>{
          cartQuantity+=cartItem.quantity
        });
        document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
    }


    document.querySelectorAll('.js-add-to-card').forEach((button)=>{
      button.addEventListener('click',()=> {
        const productId = button.dataset.productId;
        const container = button.closest('.product-container');
        const qtyEl = container ? container.querySelector('.product-quantity-container select') : null;
        const qty = Math.max(1, Number(qtyEl && qtyEl.value) || 1);
        addToCart(productId, qty);
        updateCartQuantity();

        const addedEl = container && container.querySelector('.added-to-cart');
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

    // After rendering, focus a product if specified in the URL hash
    focusProductFromHash();
}

// Focus/highlight a product element if window.location.hash matches
function focusProductFromHash(){
  const hash = window.location.hash; // e.g. #product-123
  if (!hash || !hash.startsWith('#product-')) return;
  const el = document.querySelector(hash);
  if (!el) return;
  // Scroll into view smoothly
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { el.scrollIntoView(); }
  // Temporary highlight
  const prevStyle = el.style.boxShadow;
  el.style.boxShadow = '0 0 0 3px #ffd814, 0 0 10px 4px rgba(255,216,20,0.6)';
  setTimeout(() => { el.style.boxShadow = prevStyle || ''; }, 1800);
}

// Respond to hash changes dynamically (e.g. when set by searchSuggestions)
window.addEventListener('hashchange', () => {
  // Defer to ensure element exists (in case of re-render)
  setTimeout(focusProductFromHash, 50);
});