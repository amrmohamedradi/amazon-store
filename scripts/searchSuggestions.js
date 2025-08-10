/**
 * Search Suggestions Module
 *
 * Live suggestions powered by real products from `data/products.js`.
 * Filters on product `name` and `keywords` (array or string).
 */

// Use real data and cart APIs
import { products, loadProductsFetch } from '../data/products.js';
import { addToCart } from '../data/cart.js';

// Keyboard navigation state
let currentSuggestions = [];
let activeIndex = -1; // -1 = none selected

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initSearchSuggestions();
});

/**
 * Initialize the search suggestions functionality
 */
function initSearchSuggestions() {
  // Get the search bar element
  const searchBar = document.querySelector('.search-bar');
  
  // If search bar doesn't exist on this page, exit early
  if (!searchBar) return;
  
  // Create and append the suggestions container
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions-container';
  searchBar.parentNode.appendChild(suggestionsContainer);
  
  // Add event listener for input changes
  searchBar.addEventListener('input', debounce(handleSearchInput, 300));

  // Handle Enter/Escape keys on the search bar
  searchBar.addEventListener('keydown', async (e) => {
    const suggestionsContainer = document.querySelector('.search-suggestions-container');
    if (e.key === 'Enter') {
      const query = (searchBar.value || '').trim().toLowerCase();
      if (!query) return;
      // If a suggestion is active, navigate to it; otherwise run full search
      if (activeIndex >= 0 && currentSuggestions[activeIndex]) {
        navigateToProduct(currentSuggestions[activeIndex]);
      } else {
        await runSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      if (!suggestionsContainer?.classList.contains('active')) return;
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      if (!suggestionsContainer?.classList.contains('active')) return;
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Escape') {
      suggestionsContainer?.classList.remove('active');
      if (suggestionsContainer) suggestionsContainer.innerHTML = '';
      activeIndex = -1;
      currentSuggestions = [];
    }
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !suggestionsContainer.contains(event.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });
  
  // Handle search button click
  const searchButton = document.querySelector('.search-button');
  if (searchButton) {
    searchButton.addEventListener('click', async () => {
      const query = (searchBar.value || '').trim().toLowerCase();
      if (!query) return;
      await runSearch(query);
    });
  }
}

/**
 * Run a search and navigate to the first matching product if available
 * @param {string} query
 */
async function runSearch(query) {
  // Build relative to current page so it works in subpaths (e.g., GitHub Pages)
  const url = new URL('search.html', window.location.href);
  url.searchParams.set('q', query);
  window.location.href = url.toString();
}

/**
 * Handle search input changes
 * @param {Event} event - The input event
 */
async function handleSearchInput(event) {
  const searchBar = event.target;
  const searchQuery = searchBar.value.trim().toLowerCase();
  const suggestionsContainer = document.querySelector('.search-suggestions-container');
  
  // Clear and hide suggestions if search query is empty
  if (!searchQuery) {
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.classList.remove('active');
    return;
  }
  
  try {
    // Ensure products are loaded
    const list = await getProducts();
    
    // Filter products based on search query
    const filteredProducts = filterProducts(list, searchQuery);
    currentSuggestions = filteredProducts;
    activeIndex = -1; // reset highlight on new input
    
    // Display suggestions
    displaySuggestions(filteredProducts, searchQuery, suggestionsContainer);
    
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

/**
 * Get products from the data source
 * @returns {Promise<Array>} - Promise resolving to array of products
 */
async function getProducts() {
  // If already loaded by other pages/modules
  if (Array.isArray(products) && products.length > 0) return products;
  // Load from backend via existing API
  await loadProductsFetch();
  return products;
}

/**
 * Filter products based on search query
 * @param {Array} products - Array of product objects
 * @param {string} query - Search query
 * @returns {Array} - Filtered products
 */
function filterProducts(list, query) {
  return list.filter((product) => {
    const name = (product.name || '').toLowerCase();
    const kw = product.keywords;
    const keywordsStr = Array.isArray(kw) ? kw.join(' ').toLowerCase() : String(kw || '').toLowerCase();
    return name.includes(query) || keywordsStr.includes(query);
  }).slice(0, 5);
}

/**
 * Display search suggestions
 * @param {Array} products - Filtered products to display
 * @param {string} query - Search query
 * @param {HTMLElement} container - Container element for suggestions
 */
function displaySuggestions(list, query, container) {
  // Clear previous suggestions
  container.innerHTML = '';
  
  // Show container
  container.classList.add('active');
  
  // If no matching products found
  if (list.length === 0) {
    container.innerHTML = `
      <div class="search-no-results">
        No products found matching "${query}"
      </div>
    `;
    return;
  }
  
  // Create suggestion elements for each product
  list.forEach((product, index) => {
    const suggestionElement = document.createElement('div');
    suggestionElement.className = 'search-suggestion';
    suggestionElement.dataset.index = String(index);
    
    // Create HTML for the suggestion
    suggestionElement.innerHTML = `
      <img class="search-suggestion-image" src="${product.image || ''}" alt="${product.name || ''}">
      <div class="search-suggestion-title">${product.name || ''}</div>
      <div class="search-suggestion-keywords">${Array.isArray(product.keywords) ? product.keywords.join(', ') : (product.keywords || '')}</div>
    `;
    
    // Add click event to navigate to product
    suggestionElement.addEventListener('click', () => {
      navigateToProduct(product);
      // Close suggestions
      container.classList.remove('active');
      container.innerHTML = '';
      activeIndex = -1;
      currentSuggestions = [];
    });

    // Hover updates active selection (visual only)
    suggestionElement.addEventListener('mouseenter', () => {
      setActiveIndex(index, container);
    });
    
    container.appendChild(suggestionElement);
  });
}

// Move active selection by delta (+1 or -1)
function moveActive(delta) {
  const container = document.querySelector('.search-suggestions-container');
  if (!container) return;
  const items = Array.from(container.querySelectorAll('.search-suggestion'));
  if (!items.length) return;
  // Compute next index (wrap around)
  const next = (activeIndex + delta + items.length) % items.length;
  setActiveIndex(next, container);
}

function setActiveIndex(index, container) {
  const items = Array.from(container.querySelectorAll('.search-suggestion'));
  items.forEach((el) => el.classList.remove('active'));
  activeIndex = index;
  const el = items[index];
  if (el) {
    el.classList.add('active');
    // Ensure visible
    try { el.scrollIntoView({ block: 'nearest' }); } catch {}
  }
}

/**
 * Navigate to product page or show product details
 * @param {Object} product - Product to navigate to
 */
function navigateToProduct(product) {
  // Navigate to dedicated product page, relative to current page
  const url = new URL('product.html', window.location.href);
  url.searchParams.set('id', product.id);
  window.location.href = url.toString();
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}