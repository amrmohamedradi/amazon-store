import {cart,removeFromCart,updateDeliveryOption,updateQuantity, clearCart} from'../../data/cart.js';
import {products,getProduct} from '../../data/products.js';
import {formatCurrency} from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import {deliveryOptions,getDeliveryOption} from '../../data/deliveryOptions.js';
import {renderpaymentSummary} from '../checkout/paymentSummary.js';

function updateCheckoutHeader(){
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  
  const checkoutHeader = document.querySelector('.js-checkout-header-item-count');
  if(checkoutHeader) {
    checkoutHeader.innerHTML = cartQuantity;
  }
}

export function renderOrderSummary(){

      // If cart is empty, show empty state and return
      if (!cart || cart.length === 0) {
        const emptyHTML = `
          <div class="empty-cart">
            <div class="empty-cart-title">Your cart is empty.</div>
            <a href="index.html">
              <button class="button-primary">View products</button>
            </a>
          </div>
        `;
        document.querySelector('.js-order-summary').innerHTML = emptyHTML;
        updateCheckoutHeader();
        renderpaymentSummary();
        return;
      }

      // Controls (Delete all)
      let controlsHTML = `
        <div class="cart-controls">
          <button class="button-primary clear-cart-button js-clear-cart">Delete all</button>
        </div>
      `;

      let cartSummaryHTML = '';

      cart.forEach((cartItem)=>{
      const productId = cartItem.productId;

      const matchingProduct = getProduct(productId);

      const deliveryOptionId = cartItem.deliveryOptionId;

      const deliveryOption = getDeliveryOption(deliveryOptionId);
      
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays,'days');
      const dateString = deliveryDate.format('dddd, MMMM D');
      
      cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
          
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image"
            src="${matchingProduct.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              ${matchingProduct.getPrice()}
            </div>
            <div class="product-quantity js-product-quantity-${matchingProduct.id}">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
                Update
              </span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTMl(matchingProduct,cartItem)}
          </div>
        </div>
      </div>
      `
    });


    function deliveryOptionsHTMl(matchingProduct,cartItem){
      let html =''; 
      deliveryOptions.forEach((deliveryOption) =>{
      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays,'days');
      const dateString = deliveryDate.format('dddd, MMMM D');

      const priceString = deliveryOption.priceCents === 0 ? 'Free': `$${formatCurrency(deliveryOption.priceCents)}`;
      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;


    html += `
      <div class="delivery-option js-delivery-option" data-product-id = "${matchingProduct.id}" data-delivery-option-id = "${deliveryOption.id}">
        <input type="radio"
        ${isChecked? 'checked': ''}
          class="delivery-option-input"
          name="delivery-option-${matchingProduct.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} - Shipping
          </div>
        </div>
      </div>
      
    `
    });
    return html
    };


    document.querySelector('.js-order-summary').innerHTML = controlsHTML + cartSummaryHTML;
    updateCheckoutHeader();


    document.querySelectorAll('.js-delete-link').forEach((link)=>{
          link.addEventListener('click', () => {
          const productId = link.dataset.productId;
          removeFromCart(productId);
          
          const container = document.querySelector(`.js-cart-item-container-${productId}`);
          container.remove();
          updateCheckoutHeader();
          renderpaymentSummary();

          // If cart becomes empty after delete, re-render empty state
          if (cart.length === 0) {
            renderOrderSummary();
          }
        });
        });

    document.querySelectorAll('.js-update-link').forEach((link)=>{
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        
        const container = document.querySelector(`.js-product-quantity-${productId}`);
        container.innerHTML = `
          <span>
            Quantity: <input class="quantity-input js-quantity-input-${productId}" type="number" value="${getCurrentQuantity(productId)}" min="1" max="100">
          </span>
          <span class="save-quantity-link link-primary js-save-link" data-product-id="${productId}">
            Save
          </span>
          <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${productId}">
            Delete
          </span>
        `;

        // Add event listener for the new Save button
        document.querySelector(`.js-save-link[data-product-id="${productId}"]`).addEventListener('click', () => {
          const newQuantity = Number(document.querySelector(`.js-quantity-input-${productId}`).value);
          
          if(newQuantity < 1 || newQuantity >= 1000) {
            alert('Quantity must be at least 1 and less than 1000');
            return;
          }
          
          updateQuantity(productId, newQuantity);
          renderOrderSummary();
          renderpaymentSummary();
        });

        // Add event listener for the new Delete button
        document.querySelector(`.js-delete-link[data-product-id="${productId}"]`).addEventListener('click', () => {
          removeFromCart(productId);
          const itemContainer = document.querySelector(`.js-cart-item-container-${productId}`);
          itemContainer.remove();
          updateCheckoutHeader();
          renderpaymentSummary();

          if (cart.length === 0) {
            renderOrderSummary();
          }
        });
      });
    });

    document.querySelectorAll('.js-delivery-option')
        .forEach((element)=>{
          element.addEventListener('click', () => {
            const {productId, deliveryOptionId} = element.dataset
            updateDeliveryOption(productId, deliveryOptionId);
            renderOrderSummary();
            renderpaymentSummary();
          })
        }) 

    // Bind Delete all button
    const clearBtn = document.querySelector('.js-clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!cart || cart.length === 0) return;
        clearCart();
        renderOrderSummary();
        renderpaymentSummary();
      });
    }
}

function getCurrentQuantity(productId){
  let matchingItem;
  
  cart.forEach((cartItem)=>{
    if(productId === cartItem.productId){
      matchingItem = cartItem;
    }
  });
  
  return matchingItem ? matchingItem.quantity : 1;
}