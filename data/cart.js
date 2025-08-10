export let cart;

loadFromStorage();

function loadFromStorage(){
    cart = JSON.parse(localStorage.getItem('cart')) || [];
}


function saveToStorage(){
  localStorage.setItem('cart',JSON.stringify(cart));
  // Notify all listeners (current tab) that the cart has changed
  try {
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  } catch (e) {
    // no-op if CustomEvent/window not available
  }
};

export function addToCart(productId, quantity = 1) {
    const addQty = Math.max(1, Number(quantity) || 1);
    let matchingItem;

    cart.forEach((cartItem)=>{
      if(productId === cartItem.productId){
        matchingItem = cartItem;
      }
    });

    if(matchingItem){
      matchingItem.quantity = (Number(matchingItem.quantity) || 0) + addQty;
    } else{
      cart.push({
        productId,
        quantity : addQty,
        deliveryOptionId :'1'
      });
    };
    saveToStorage();
};

export function removeFromCart(productId){
  const newCart = [];

  cart.forEach((cartItem) => {
    if(cartItem.productId !== productId){
      newCart.push(cartItem)
    };
  });

  cart = newCart;
  saveToStorage();
};

export function updateQuantity(productId, newQuantity){
  let matchingItem;

  cart.forEach((cartItem)=>{
    if(productId === cartItem.productId){
      matchingItem = cartItem;
    }
  });

  if(matchingItem){
    matchingItem.quantity = newQuantity;
  }
  
  saveToStorage();
};

export function updateDeliveryOption(productId,deliveryOptionId){
  let matchingItem;

  cart.forEach((cartItem)=>{
    if(productId === cartItem.productId){
      matchingItem = cartItem;
    }
  });

  matchingItem.deliveryOptionId = deliveryOptionId;
  
  saveToStorage();
};



export function loadCart(fun){
  const xhr = new XMLHttpRequest();

xhr.addEventListener('load', ()=>{
      fun();
});
  xhr.open('Get','https://supersimplebackend.dev/cart');
  xhr.send();
}

// Clear all items from cart
export function clearCart() {
  cart = [];
  saveToStorage();
}