import {cart} from '../../data/cart.js';
import {getProduct} from '../../data/products.js';
import {getDeliveryOption} from '../../data/deliveryOptions.js';
import {formatCurrency} from '../utils/money.js';


export function renderpaymentSummary(){
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  let cartQuantity = 0;
  
  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
    
    cartQuantity += cartItem.quantity;
  });
  const totalBeforeTaxCents = shippingPriceCents + productPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  const totalCents = totalBeforeTaxCents + taxCents;

  const isEmpty = !cart || cart.length === 0;
  const displayItemsCount = isEmpty ? 0 : cartQuantity;
  const displayProductPrice = isEmpty ? 0 : productPriceCents;
  const displayShipping = isEmpty ? 0 : shippingPriceCents;
  const displaySubtotal = isEmpty ? 0 : totalBeforeTaxCents;
  const displayTax = isEmpty ? 0 : taxCents;
  const displayTotal = isEmpty ? 0 : totalCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
    Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${displayItemsCount}):</div>
      <div class="payment-summary-money">$${formatCurrency(displayProductPrice)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatCurrency(displayShipping)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatCurrency(displaySubtotal)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatCurrency(displayTax)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatCurrency(displayTotal)}</div>
    </div>

    <button class="place-order-button button-primary js-place-order" ${isEmpty ? 'disabled' : ''}>
      Place your order
    </button>
    
    `
    document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

    // If empty, do not attach click listener
    if (isEmpty) return;

    // Add event listener to the Place Order button
    document.querySelector('.js-place-order').addEventListener('click', async () => {
      if (cart.length === 0) {
        return;
      }

      try {
        // Show loading state
        const button = document.querySelector('.js-place-order');
        button.innerHTML = 'Processing...';
        button.disabled = true;

        // Create order data
        const orderId = generateOrderId();
        const createdAtMs = Date.now();
        const orderDate = new Date(createdAtMs).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });

        const orderData = {
          orderId: orderId,
          orderDate: orderDate,
          createdAtMs: createdAtMs,
          cart: [...cart], // Copy cart items
          totalCents: totalCents,
          productPriceCents: productPriceCents,
          shippingPriceCents: shippingPriceCents,
          taxCents: taxCents
        };

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));

        // Save order to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
        existingOrders.unshift(orderData); // Add to beginning
        localStorage.setItem('orders', JSON.stringify(existingOrders));

        // Clear the cart
        localStorage.removeItem('cart');
        
        // Redirect to orders page with all details
        window.location.href = 'orders.html';

      } catch (error) {
        // Reset button on error
        const button = document.querySelector('.js-place-order');
        if (button) {
          button.innerHTML = 'Place your order';
          button.disabled = false;
        }
      }
    });
};

function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}
