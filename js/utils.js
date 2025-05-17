/**
 * Utility functions for IDLIX movie streaming website
 */

/**
 * Create a movie card element
 * @param {Object} movie - Movie data
 * @param {boolean} featured - Whether the movie is featured
 * @returns {HTMLElement} - Movie card element
 */
export function createMovieCard(movie, featured = false) {
  const card = document.createElement('div');
  card.className = 'movie-card group';
  card.dataset.id = movie.id;
  card.dataset.type = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
  
  const posterPath = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';
  
  const title = movie.title || movie.name || 'Unknown Title';
  const year = getYearFromDate(movie.release_date || movie.first_air_date || '');
  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) + '%' : 'N/A';
  
  card.innerHTML = `
    <div class="poster relative overflow-hidden rounded-md shadow-lg bg-gray-800">
      <img src="${posterPath}" alt="${title}" class="w-full h-full object-cover transition-all duration-300">
      ${featured ? '<div class="featured-badge">FEATURED</div>' : ''}
      <div class="rating">${rating}</div>
      <div class="overlay flex flex-col justify-end">
        <button class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded text-sm mt-2 transition duration-300 btn-hover">
          <i class="fas fa-play mr-2"></i>Watch Now
        </button>
      </div>
    </div>
    <h3 class="text-sm font-medium mt-2 truncate">${title}</h3>
    <div class="flex justify-between text-xs text-gray-400">
      <span>${year}</span>
      <span>${card.dataset.type === 'tv' ? 'TV Series' : 'Movie'}</span>
    </div>
  `;
  
  return card;
}

/**
 * Extract year from date string
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - Year or 'N/A' if date is invalid
 */
export function getYearFromDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.getFullYear().toString();
}

/**
 * Format runtime as hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} - Formatted runtime (e.g. "2h 15m")
 */
export function formatRuntime(minutes) {
  if (!minutes) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (mins > 0) result += `${mins}m`;
  
  return result.trim();
}

/**
 * Format date as Month DD, YYYY
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format number with commas as thousands separators
 * @param {number} number - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(number) {
  if (number === undefined || number === null) return 'N/A';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Create a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
export function showToast(message, type = 'success') {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast fixed top-4 right-4 px-4 py-2 rounded-md text-white shadow-lg transition-opacity duration-300 z-50';
  
  // Set background color based on type
  switch (type) {
    case 'error':
      toast.classList.add('bg-red-600');
      break;
    case 'info':
      toast.classList.add('bg-blue-500');
      break;
    case 'success':
    default:
      toast.classList.add('bg-green-500');
      break;
  }
  
  // Set toast content
  toast.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button class="ml-4 text-white focus:outline-none">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(toast);
  
  // Add event listener for close button
  const closeButton = toast.querySelector('button');
  closeButton.addEventListener('click', () => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  });
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Create a cast member card
 * @param {Object} person - Cast member data
 * @returns {HTMLElement} - Cast card element
 */
export function createCastCard(person) {
  const card = document.createElement('div');
  card.className = 'flex flex-col items-center text-center w-32';
  
  const profilePath = person.profile_path 
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : 'https://via.placeholder.com/185x185?text=No+Image';
  
  card.innerHTML = `
    <div class="w-32 h-32 rounded-full overflow-hidden mb-2">
      <img src="${profilePath}" alt="${person.name}" class="w-full h-full object-cover">
    </div>
    <h4 class="font-medium text-sm">${person.name}</h4>
    <p class="text-xs text-gray-400">${person.character || person.job || ''}</p>
  `;
  
  return card;
}

/**
 * Toggle mobile menu
 */
export function setupMobileMenu() {
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Mobile submenus
  const mobileGenreButton = document.getElementById('mobileGenreButton');
  const mobileGenreMenu = document.getElementById('mobileGenreMenu');
  
  if (mobileGenreButton && mobileGenreMenu) {
    mobileGenreButton.addEventListener('click', () => {
      mobileGenreMenu.classList.toggle('hidden');
      // Toggle chevron icon
      const icon = mobileGenreButton.querySelector('i');
      icon.classList.toggle('fa-chevron-down');
      icon.classList.toggle('fa-chevron-up');
    });
  }
  
  const mobileYearButton = document.getElementById('mobileYearButton');
  const mobileYearMenu = document.getElementById('mobileYearMenu');
  
  if (mobileYearButton && mobileYearMenu) {
    mobileYearButton.addEventListener('click', () => {
      mobileYearMenu.classList.toggle('hidden');
      // Toggle chevron icon
      const icon = mobileYearButton.querySelector('i');
      icon.classList.toggle('fa-chevron-down');
      icon.classList.toggle('fa-chevron-up');
    });
  }
}

/**
 * Setup search functionality
 */
export function setupSearch() {
  // Helper function to handle search input
  const handleSearch = (input) => {
    if (!input) return;
    
    const query = input.value.trim();
    if (query) {
      window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
  };
  
  // Main search form
  const mainSearchInput = document.getElementById('mainSearchInput');
  const mainSearchButton = document.getElementById('mainSearchButton');
  
  if (mainSearchInput && mainSearchButton) {
    mainSearchButton.addEventListener('click', () => handleSearch(mainSearchInput));
    mainSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(mainSearchInput);
    });
  }
  
  // Navbar search
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  if (searchInput && searchButton) {
    searchButton.addEventListener('click', () => handleSearch(searchInput));
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(searchInput);
    });
  }
  
  // Mobile search
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const mobileSearchButton = document.getElementById('mobileSearchButton');
  
  if (mobileSearchInput && mobileSearchButton) {
    mobileSearchButton.addEventListener('click', () => handleSearch(mobileSearchInput));
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(mobileSearchInput);
    });
  }
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} - Parameter value or null if not found
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export default {
  createMovieCard,
  getYearFromDate,
  formatRuntime,
  formatDate,
  formatNumber,
  showToast,
  createCastCard,
  setupMobileMenu,
  setupSearch,
  getQueryParam
};