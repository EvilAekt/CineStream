/**
 * TV Show Details Page Script
 */

import * as api from './api.js';
import { 
  getQueryParam, 
  createMovieCard, 
  createCastCard, 
  formatDate, 
  setupMobileMenu, 
  setupSearch 
} from './utils.js';
import { updateUIForAuthState } from './auth.js';

/**
 * Initialize the TV show details page
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
  
  // Get TV show ID from URL
  const tvId = getQueryParam('id');
  
  if (!tvId) {
    showError('No TV show ID provided');
    return;
  }
  
  try {
    // Fetch TV show details
    const tvDetails = await api.getTVShowDetails(tvId);
    
    // Update page title
    document.title = `${tvDetails.name} - IDLIX`;
    
    // Render TV show details
    renderTVDetails(tvDetails);
    
    // Render seasons
    renderSeasons(tvDetails.seasons);
    
    // Render cast
    renderCast(tvDetails.credits.cast);
    
    // Render similar TV shows
    renderSimilarTVShows(tvDetails.similar.results);
  } catch (error) {
    console.error('Error loading TV show details:', error);
    showError('Failed to load TV show details');
  }
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
 * Render TV show details
 * @param {Object} tvShow - TV show details
 */
function renderTVDetails(tvShow) {
  const tvDetails = document.getElementById('tvDetails');
  const tvLoading = document.getElementById('tvLoading');
  
  if (!tvDetails || !tvLoading) return;
  
  // Get poster and backdrop URLs
  const posterUrl = api.getImageUrl(tvShow.poster_path);
  const backdropUrl = api.getBackdropUrl(tvShow.backdrop_path);
  
  // Format TV show information
  const title = tvShow.name;
  const firstAirDate = formatDate(tvShow.first_air_date);
  const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A';
  const genres = tvShow.genres.map(genre => genre.name).join(', ');
  const rating = tvShow.vote_average ? (tvShow.vote_average * 10).toFixed(0) + '%' : 'N/A';
  const overview = tvShow.overview || 'No overview available';
  
  // Additional information
  const status = tvShow.status || 'N/A';
  const seasons = tvShow.number_of_seasons || 'N/A';
  const episodes = tvShow.number_of_episodes || 'N/A';
  const runtime = tvShow.episode_run_time?.length > 0 
    ? `${tvShow.episode_run_time[0]} min` 
    : 'N/A';
  
  // Create HTML for TV show details
  tvDetails.innerHTML = `
    <div class="relative">
      ${tvShow.backdrop_path ? `
        <div class="absolute inset-0 opacity-20 z-0">
          <img src="${backdropUrl}" alt="" class="w-full h-full object-cover">
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-0"></div>
      ` : ''}
      
      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row">
          <div class="lg:w-1/4">
            <img src="${posterUrl}" alt="${title}" class="w-full rounded-lg shadow-lg">
          </div>
          
          <div class="lg:w-3/4 lg:pl-8 mt-6 lg:mt-0">
            <h1 class="text-3xl font-bold">${title} <span class="text-gray-400">(${year})</span></h1>
            
            <div class="flex flex-wrap mt-4">
              ${tvShow.genres.map(genre => 
                `<span class="genre-pill">${genre.name}</span>`
              ).join('')}
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Rating:</strong> <span class="text-yellow-500">${rating}</span></p>
                <p><strong>First Air Date:</strong> ${firstAirDate}</p>
                <p><strong>Status:</strong> ${status}</p>
                ${tvShow.in_production ? '<p><strong>In Production:</strong> Yes</p>' : ''}
              </div>
              
              <div>
                <p><strong>Seasons:</strong> ${seasons}</p>
                <p><strong>Episodes:</strong> ${episodes}</p>
                <p><strong>Episode Runtime:</strong> ${runtime}</p>
                <p><strong>Original Language:</strong> ${tvShow.original_language?.toUpperCase() || 'N/A'}</p>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-xl font-semibold mb-2">Overview</h3>
              <p class="text-gray-300">${overview}</p>
            </div>
            
            <div class="mt-6">
              ${tvShow.created_by?.length > 0 ? `
                <h3 class="text-lg font-semibold mb-2">Created By</h3>
                <p>${tvShow.created_by.map(creator => creator.name).join(', ')}</p>
              ` : ''}
            </div>
            
            <div class="mt-8">
              <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 btn-hover">
                <i class="fas fa-play mr-2"></i>Watch Now
              </button>
              ${tvShow.homepage ? `
                <a href="${tvShow.homepage}" target="_blank" rel="noopener noreferrer" 
                   class="ml-4 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition duration-300 btn-hover">
                  <i class="fas fa-external-link-alt mr-2"></i>Official Site
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Hide loading, show details
  tvLoading.classList.add('hidden');
  tvDetails.classList.remove('hidden');
}

/**
 * Render seasons section
 * @param {Array} seasons - TV show seasons
 */
function renderSeasons(seasons) {
  const seasonsContainer = document.getElementById('seasonsContainer');
  if (!seasonsContainer) return;
  
  // Clear loading placeholders
  seasonsContainer.innerHTML = '';
  
  // Filter out special seasons (e.g., specials with season_number = 0)
  const mainSeasons = seasons.filter(season => season.season_number > 0);
  
  // If no seasons
  if (!mainSeasons.length) {
    seasonsContainer.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-400">No seasons information available</p>
      </div>
    `;
    return;
  }
  
  // Create and append season cards
  mainSeasons.forEach(season => {
    const posterUrl = season.poster_path 
      ? api.getImageUrl(season.poster_path)
      : 'https://via.placeholder.com/300x450?text=No+Image';
    
    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl hover:transform hover:scale-105';
    
    card.innerHTML = `
      <img src="${posterUrl}" alt="${season.name}" class="w-full h-64 object-cover">
      <div class="p-4">
        <h3 class="font-bold">${season.name}</h3>
        <div class="text-sm text-gray-400">
          <p>${season.episode_count} Episodes</p>
          <p>${formatDate(season.air_date) || 'No air date'}</p>
        </div>
      </div>
    `;
    
    seasonsContainer.appendChild(card);
  });
}

/**
 * Render cast section
 * @param {Array} cast - Cast members
 */
function renderCast(cast) {
  const castContainer = document.getElementById('castContainer');
  if (!castContainer) return;
  
  // Clear loading placeholders
  castContainer.innerHTML = '';
  
  // Show up to 15 cast members
  const mainCast = cast.slice(0, 15);
  
  // Create and append cast cards
  mainCast.forEach(person => {
    const card = createCastCard(person);
    castContainer.appendChild(card);
  });
}

/**
 * Render similar TV shows
 * @param {Array} shows - Similar TV shows
 */
function renderSimilarTVShows(shows) {
  const similarTVShowsContainer = document.getElementById('similarTVShows');
  if (!similarTVShowsContainer) return;
  
  // Clear loading placeholders
  similarTVShowsContainer.innerHTML = '';
  
  // If no similar TV shows
  if (!shows.length) {
    similarTVShowsContainer.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-400">No similar TV shows found</p>
      </div>
    `;
    return;
  }
  
  // Show up to 6 similar TV shows
  const similarShows = shows.slice(0, 6);
  
  // Create and append TV show cards
  similarShows.forEach(show => {
    // Add media_type for identification
    show.media_type = 'tv';
    
    const card = createMovieCard(show);
    similarTVShowsContainer.appendChild(card);
  });
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const tvDetails = document.getElementById('tvDetails');
  const tvLoading = document.getElementById('tvLoading');
  
  if (!tvDetails || !tvLoading) return;
  
  tvLoading.classList.add('hidden');
  
  tvDetails.classList.remove('hidden');
  tvDetails.innerHTML = `
    <div class="text-center py-16">
      <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
      <h2 class="text-2xl font-bold mb-2">Error</h2>
      <p class="text-gray-400">${message}</p>
      <a href="index.html" class="inline-block mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full transition duration-300">
        <i class="fas fa-home mr-2"></i>Back to Home
      </a>
    </div>
  `;
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);