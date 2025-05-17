/**
 * Search Results Page Script
 */

import * as api from './api.js';
import { 
  getQueryParam, 
  createMovieCard, 
  setupMobileMenu, 
  setupSearch 
} from './utils.js';
import { updateUIForAuthState } from './auth.js';

// Global state
let currentPage = 1;
let totalPages = 0;
let searchQuery = '';
let searchType = 'all'; // 'all', 'movie', or 'tv'

/**
 * Initialize the search page
 */
async function init() {
  // Update UI based on authentication state
  updateUIForAuthState();
  
  // Setup mobile menu
  setupMobileMenu();
  
  // Setup search functionality
  setupSearch();
  
  // Load genres for dropdown menus
  loadGenres();
  
  // Get search query from URL
  searchQuery = getQueryParam('query');
  
  if (!searchQuery) {
    showNoResults('No search query provided');
    return;
  }
  
  // Display the search query
  const searchQueryElement = document.getElementById('searchQuery');
  if (searchQueryElement) {
    searchQueryElement.textContent = searchQuery;
  }
  
  // Setup filter buttons
  setupFilterButtons();
  
  // Setup pagination
  setupPagination();
  
  // Load initial search results
  await loadSearchResults();
}

/**
 * Load movie and TV genres
 */
async function loadGenres() {
  try {
    // Get movie genres
    const movieGenres = await api.getMovieGenres();
    
    // Get TV genres
    const tvGenres = await api.getTVGenres();
    
    // Combine genres (removing duplicates)
    const uniqueGenres = [...movieGenres.genres];
    tvGenres.genres.forEach(tvGenre => {
      if (!uniqueGenres.some(g => g.id === tvGenre.id)) {
        uniqueGenres.push(tvGenre);
      }
    });
    
    // Sort genres by name
    uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));
    
    // Fill genre dropdowns
    fillGenreDropdown(uniqueGenres);
  } catch (error) {
    console.error('Error loading genres:', error);
  }
}

/**
 * Fill genre dropdown menus
 * @param {Array} genres - Array of genre objects
 */
function fillGenreDropdown(genres) {
  const genreDropdown = document.getElementById('genreDropdown');
  const mobileGenreMenu = document.getElementById('mobileGenreMenu');
  
  if (!genreDropdown || !genres.length) return;
  
  // Clear loading message
  genreDropdown.innerHTML = '';
  
  // Add genres to dropdown
  genres.forEach(genre => {
    const link = document.createElement('a');
    link.href = `movies.html?genre=${genre.id}`;
    link.className = 'block px-4 py-2 hover:bg-gray-700';
    link.textContent = genre.name;
    
    genreDropdown.appendChild(link);
    
    // Add to mobile menu if it exists
    if (mobileGenreMenu) {
      const mobileLink = link.cloneNode(true);
      mobileLink.className = 'block py-2 text-gray-300 hover:text-white';
      mobileGenreMenu.appendChild(mobileLink);
    }
  });
}

/**
 * Setup filter buttons for search results
 */
function setupFilterButtons() {
  const allFilter = document.getElementById('allFilter');
  const moviesFilter = document.getElementById('moviesFilter');
  const tvFilter = document.getElementById('tvFilter');
  
  if (!allFilter || !moviesFilter || !tvFilter) return;
  
  // Active class
  const activeClass = 'bg-red-600';
  const inactiveClass = 'bg-gray-700';
  
  // Add click event listeners
  allFilter.addEventListener('click', async () => {
    if (searchType !== 'all') {
      allFilter.classList.replace(inactiveClass, activeClass);
      moviesFilter.classList.replace(activeClass, inactiveClass);
      tvFilter.classList.replace(activeClass, inactiveClass);
      
      searchType = 'all';
      currentPage = 1;
      await loadSearchResults();
    }
  });
  
  moviesFilter.addEventListener('click', async () => {
    if (searchType !== 'movie') {
      allFilter.classList.replace(activeClass, inactiveClass);
      moviesFilter.classList.replace(inactiveClass, activeClass);
      tvFilter.classList.replace(activeClass, inactiveClass);
      
      searchType = 'movie';
      currentPage = 1;
      await loadSearchResults();
    }
  });
  
  tvFilter.addEventListener('click', async () => {
    if (searchType !== 'tv') {
      allFilter.classList.replace(activeClass, inactiveClass);
      moviesFilter.classList.replace(activeClass, inactiveClass);
      tvFilter.classList.replace(inactiveClass, activeClass);
      
      searchType = 'tv';
      currentPage = 1;
      await loadSearchResults();
    }
  });
}

/**
 * Setup pagination controls
 */
function setupPagination() {
  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');
  const currentPageElement = document.getElementById('currentPage');
  
  if (!prevPageButton || !nextPageButton || !currentPageElement) return;
  
  // Add click event listeners
  prevPageButton.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await loadSearchResults();
    }
  });
  
  nextPageButton.addEventListener('click', async () => {
    if (currentPage < totalPages) {
      currentPage++;
      await loadSearchResults();
    }
  });
}

/**
 * Load search results based on current filters and page
 */
async function loadSearchResults() {
  if (!searchQuery) return;
  
  const searchResults = document.getElementById('searchResults');
  const paginationElement = document.getElementById('pagination');
  const noResultsElement = document.getElementById('noResults');
  const currentPageElement = document.getElementById('currentPage');
  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');
  
  if (!searchResults || !paginationElement || !noResultsElement) return;
  
  // Show loading placeholders
  searchResults.innerHTML = `
    <div class="animate-pulse">
      <div class="bg-gray-800 rounded h-64"></div>
      <div class="bg-gray-800 h-4 rounded mt-2 w-3/4"></div>
      <div class="bg-gray-800 h-4 rounded mt-1 w-1/2"></div>
    </div>
    <div class="animate-pulse">
      <div class="bg-gray-800 rounded h-64"></div>
      <div class="bg-gray-800 h-4 rounded mt-2 w-3/4"></div>
      <div class="bg-gray-800 h-4 rounded mt-1 w-1/2"></div>
    </div>
    <div class="animate-pulse">
      <div class="bg-gray-800 rounded h-64"></div>
      <div class="bg-gray-800 h-4 rounded mt-2 w-3/4"></div>
      <div class="bg-gray-800 h-4 rounded mt-1 w-1/2"></div>
    </div>
    <div class="animate-pulse">
      <div class="bg-gray-800 rounded h-64"></div>
      <div class="bg-gray-800 h-4 rounded mt-2 w-3/4"></div>
      <div class="bg-gray-800 h-4 rounded mt-1 w-1/2"></div>
    </div>
  `;
  
  try {
    let results;
    
    // Fetch results based on search type
    switch (searchType) {
      case 'movie':
        results = await api.searchMovies(searchQuery, currentPage);
        break;
      case 'tv':
        results = await api.searchTVShows(searchQuery, currentPage);
        break;
      case 'all':
      default:
        results = await api.searchMulti(searchQuery, currentPage);
        break;
    }
    
    // Update pagination variables
    totalPages = results.total_pages;
    
    // Update pagination UI
    if (currentPageElement) {
      currentPageElement.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevPageButton) {
      prevPageButton.disabled = currentPage <= 1;
    }
    
    if (nextPageButton) {
      nextPageButton.disabled = currentPage >= totalPages;
    }
    
    // Show/hide pagination
    if (results.total_results > 0) {
      paginationElement.classList.remove('hidden');
      noResultsElement.classList.add('hidden');
    } else {
      paginationElement.classList.add('hidden');
      noResultsElement.classList.remove('hidden');
      searchResults.innerHTML = '';
      return;
    }
    
    // Filter results (for multi search, filter out people and other non-movie/tv results)
    let filteredResults = results.results;
    if (searchType === 'all') {
      filteredResults = results.results.filter(item => 
        item.media_type === 'movie' || item.media_type === 'tv'
      );
    } else {
      // Add media_type for movie/tv specific searches
      filteredResults = results.results.map(item => ({
        ...item,
        media_type: searchType
      }));
    }
    
    // Clear loading placeholders
    searchResults.innerHTML = '';
    
    // If no results after filtering
    if (filteredResults.length === 0) {
      paginationElement.classList.add('hidden');
      noResultsElement.classList.remove('hidden');
      return;
    }
    
    // Create and append cards for each result
    filteredResults.forEach(item => {
      const card = createMovieCard(item);
      searchResults.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading search results:', error);
    searchResults.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <h3 class="text-xl font-bold mb-2">Error</h3>
        <p class="text-gray-400">There was a problem loading the search results. Please try again later.</p>
      </div>
    `;
    paginationElement.classList.add('hidden');
  }
}

/**
 * Show no results message
 * @param {string} message - Custom message (optional)
 */
function showNoResults(message = 'No results found for your search term. Please try a different keyword.') {
  const searchResults = document.getElementById('searchResults');
  const paginationElement = document.getElementById('pagination');
  const noResultsElement = document.getElementById('noResults');
  
  if (!searchResults || !paginationElement || !noResultsElement) return;
  
  // Clear search results
  searchResults.innerHTML = '';
  
  // Hide pagination
  paginationElement.classList.add('hidden');
  
  // Show no results message
  noResultsElement.querySelector('p').textContent = message;
  noResultsElement.classList.remove('hidden');
}

// Setup movie modal as in app.js
function setupMovieModal() {
  const modal = document.getElementById('movieModal');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');
  
  if (!modal || !modalContent || !closeModal) return;
  
  // Close modal when clicking the close button
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Close modal when pressing Escape key
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);