export let savedItems;

loadSavedFromStorage();

function loadSavedFromStorage() {
  savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
}

function saveSavedToStorage() {
  localStorage.setItem('savedItems', JSON.stringify(savedItems));
}

export function listSavedItems() {
  return savedItems.slice();
}

export function addToSavedItems(productId) {
  const exists = savedItems.some((item) => item.productId === productId);
  if (!exists) {
    savedItems.push({ productId, addedAtMs: Date.now() });
    saveSavedToStorage();
  }
}

export function removeFromSavedItems(productId) {
  savedItems = savedItems.filter((item) => item.productId !== productId);
  saveSavedToStorage();
}

export function clearSavedItems() {
  savedItems = [];
  saveSavedToStorage();
} 