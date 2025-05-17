/**
 * Movie Details Page Script
 */

import * as api from './api.js';
import { 
  getQueryParam, 
  createMovieCard, 
  createCastCard, 
  formatRuntime, 
  formatDate, 
  formatNumber, 
  setupMobileMenu, 
  setupSearch 
} from './utils.js';
import { updateUIForAuthState } from './auth.js';

/**
 * Initialize the movie details page
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
  
  // Get movie ID from URL
  const movieId = getQueryParam('id');
  
  if (!movieId) {
    showError('No movie ID provided');
    return;
  }
  
  try {
    // Fetch movie details
    const movieDetails = await api.getMovieDetails(movieId);
    
    // Update page title
    document.title = `${movieDetails.title} - IDLIX`;
    
    // Render movie details
    renderMovieDetails(movieDetails);
    
    // Render cast
    renderCast(movieDetails.credits.cast);
    
    // Render similar movies
    renderSimilarMovies(movieDetails.similar.results);
  } catch (error) {
    console.error('Error loading movie details:', error);
    showError('Failed to load movie details');
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
 * Render movie details
 * @param {Object} movie - Movie details
 */
function renderMovieDetails(movie) {
  const movieDetails = document.getElementById('movieDetails');
  const movieLoading = document.getElementById('movieLoading');
  
  if (!movieDetails || !movieLoading) return;
  
  // Get poster and backdrop URLs
  const posterUrl = api.getImageUrl(movie.poster_path);
  const backdropUrl = api.getBackdropUrl(movie.backdrop_path);
  
  // Format movie information
  const title = movie.title;
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const runtime = formatRuntime(movie.runtime);
  const releaseDate = formatDate(movie.release_date);
  const genres = movie.genres.map(genre => genre.name).join(', ');
  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) + '%' : 'N/A';
  const overview = movie.overview || 'No overview available';
  
  // Additional information
  const status = movie.status || 'N/A';
  const budget = formatNumber(movie.budget) || 'N/A';
  const revenue = formatNumber(movie.revenue) || 'N/A';
  
  // Create HTML for movie details
  movieDetails.innerHTML = `
    <div class="relative">
      ${movie.backdrop_path ? `
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
              ${movie.genres.map(genre => 
                `<span class="genre-pill">${genre.name}</span>`
              ).join('')}
            </div>
            
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Rating:</strong> <span class="text-yellow-500">${rating}</span></p>
                <p><strong>Released:</strong> ${releaseDate}</p>
                <p><strong>Runtime:</strong> ${runtime}</p>
                <p><strong>Status:</strong> ${status}</p>
              </div>
              
              <div>
                <p><strong>Budget:</strong> ${budget !== 'N/A' ? '$' + budget : budget}</p>
                <p><strong>Revenue:</strong> ${revenue !== 'N/A' ? '$' + revenue : revenue}</p>
                <p><strong>Original Language:</strong> ${movie.original_language?.toUpperCase() || 'N/A'}</p>
                ${movie.production_companies?.length > 0 ? 
                  `<p><strong>Production:</strong> ${movie.production_companies[0].name}</p>` : ''}
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-xl font-semibold mb-2">Overview</h3>
              <p class="text-gray-300">${overview}</p>
            </div>
            
            <div class="mt-8">
              <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 btn-hover">
                <i class="fas fa-play mr-2"></i>Watch Now
              </button>
              ${movie.homepage ? `
                <a href="${movie.homepage}" target="_blank" rel="noopener noreferrer" 
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
  movieLoading.classList.add('hidden');
  movieDetails.classList.remove('hidden');
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
 * Render similar movies
 * @param {Array} movies - Similar movies
 */
function renderSimilarMovies(movies) {
  const similarMoviesContainer = document.getElementById('similarMovies');
  if (!similarMoviesContainer) return;
  
  // Clear loading placeholders
  similarMoviesContainer.innerHTML = '';
  
  // If no similar movies
  if (!movies.length) {
    similarMoviesContainer.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-gray-400">No similar movies found</p>
      </div>
    `;
    return;
  }
  
  // Show up to 6 similar movies
  const similarMovies = movies.slice(0, 6);
  
  // Create and append movie cards
  similarMovies.forEach(movie => {
    // Add media_type for identification
    movie.media_type = 'movie';
    
    const card = createMovieCard(movie);
    similarMoviesContainer.appendChild(card);
  });
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const movieDetails = document.getElementById('movieDetails');
  const movieLoading = document.getElementById('movieLoading');
  
  if (!movieDetails || !movieLoading) return;
  
  movieLoading.classList.add('hidden');
  
  movieDetails.classList.remove('hidden');
  movieDetails.innerHTML = `
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