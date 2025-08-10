import {renderOrderSummary} from './checkout/orderSummary.js';
import {renderpaymentSummary} from './checkout/paymentSummary.js';
import{loadProducts,loadProductsFetch} from '../data/products.js';
import {loadCart} from '../data/cart.js';
import {cart} from '../data/cart.js';

function updateCheckoutHeaderOnLoad(){
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  
  const checkoutHeader = document.querySelector('.js-checkout-header-item-count');
  if(checkoutHeader) {
    checkoutHeader.innerHTML = cartQuantity;
  }
}

async function loadPage(){
  await loadProductsFetch();
  await new Promise((resolve) => {
      loadCart(() => {
        resolve();
      });
  })
    renderOrderSummary();
    renderpaymentSummary();
    updateCheckoutHeaderOnLoad();
}

loadPage();


