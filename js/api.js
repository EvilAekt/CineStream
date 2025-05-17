/**
 * TMDB API Service
 * Handles all API calls to The Movie Database
 */

// TMDB API configuration
const API_KEY = "5753f7ff19f381dd7b67eee1ea8b8164a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image sizes
const BACKDROP_SIZE = "w1280";
const POSTER_SIZE = "w500";
const PROFILE_SIZE = "w185";

/**
 * Fetch data from TMDB API with error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Additional parameters
 * @returns {Promise} - Promise with the API response
 */
async function fetchFromAPI(endpoint, params = {}) {
  const headers = {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NzUzN2ZmMTlmMzgxZGQ3YjY3ZWVlMWVhOGI4MTY0YSIsInN1YiI6IjVlM2ExNmU1MGMyNzEwMDAxODc1NTI4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nOpZ_nBtA93tbzr6-rxD0760tssAAaSppyjRv9anArs",
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?${new URLSearchParams(params)}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Get movie genres list
 * @returns {Promise} - Promise with the genres list
 */
export function getMovieGenres() {
  return fetchFromAPI("/genre/movie/list");
}

/**
 * Get TV show genres list
 * @returns {Promise} - Promise with the genres list
 */
export function getTVGenres() {
  return fetchFromAPI("/genre/tv/list");
}

/**
 * Get popular movies
 * @param {number} page - Page number
 * @returns {Promise} - Promise with popular movies
 */
export function getPopularMovies(page = 1) {
  return fetchFromAPI("/movie/popular", { page });
}

/**
 * Get top rated movies
 * @param {number} page - Page number
 * @returns {Promise} - Promise with top rated movies
 */
export function getTopRatedMovies(page = 1) {
  return fetchFromAPI("/movie/top_rated", { page });
}

/**
 * Get upcoming movies
 * @param {number} page - Page number
 * @returns {Promise} - Promise with upcoming movies
 */
export function getUpcomingMovies(page = 1) {
  return fetchFromAPI("/movie/upcoming", { page });
}

/**
 * Get popular TV shows
 * @param {number} page - Page number
 * @returns {Promise} - Promise with popular TV shows
 */
export function getPopularTVShows(page = 1) {
  return fetchFromAPI("/tv/popular", { page });
}

/**
 * Get top rated TV shows
 * @param {number} page - Page number
 * @returns {Promise} - Promise with top rated TV shows
 */
export function getTopRatedTVShows(page = 1) {
  return fetchFromAPI("/tv/top_rated", { page });
}

/**
 * Get TV shows airing today
 * @param {number} page - Page number
 * @returns {Promise} - Promise with TV shows airing today
 */
export function getTVShowsAiringToday(page = 1) {
  return fetchFromAPI("/tv/airing_today", { page });
}

/**
 * Get TV shows on the air
 * @param {number} page - Page number
 * @returns {Promise} - Promise with TV shows on the air
 */
export function getTVShowsOnTheAir(page = 1) {
  return fetchFromAPI("/tv/on_the_air", { page });
}

/**
 * Get movie details
 * @param {number} id - Movie ID
 * @returns {Promise} - Promise with movie details
 */
export function getMovieDetails(id) {
  return fetchFromAPI(`/movie/${id}`, {
    append_to_response: "credits,videos,similar",
  });
}

/**
 * Get TV show details
 * @param {number} id - TV show ID
 * @returns {Promise} - Promise with TV show details
 */
export function getTVShowDetails(id) {
  return fetchFromAPI(`/tv/${id}`, {
    append_to_response: "credits,videos,similar,seasons",
  });
}

/**
 * Search movies and TV shows
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise} - Promise with search results
 */
export function searchMulti(query, page = 1) {
  return fetchFromAPI("/search/multi", { query, page });
}

/**
 * Search movies
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise} - Promise with search results
 */
export function searchMovies(query, page = 1) {
  return fetchFromAPI("/search/movie", { query, page });
}

/**
 * Search TV shows
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise} - Promise with search results
 */
export function searchTVShows(query, page = 1) {
  return fetchFromAPI("/search/tv", { query, page });
}

/**
 * Get movies by genre
 * @param {number} genreId - Genre ID
 * @param {number} page - Page number
 * @returns {Promise} - Promise with movies
 */
export function getMoviesByGenre(genreId, page = 1) {
  return fetchFromAPI("/discover/movie", { with_genres: genreId, page });
}

/**
 * Get TV shows by genre
 * @param {number} genreId - Genre ID
 * @param {number} page - Page number
 * @returns {Promise} - Promise with TV shows
 */
export function getTVShowsByGenre(genreId, page = 1) {
  return fetchFromAPI("/discover/tv", { with_genres: genreId, page });
}

/**
 * Get movies by year
 * @param {number} year - Year
 * @param {number} page - Page number
 * @returns {Promise} - Promise with movies
 */
export function getMoviesByYear(year, page = 1) {
  return fetchFromAPI("/discover/movie", { primary_release_year: year, page });
}

/**
 * Get TV shows by year
 * @param {number} year - Year
 * @param {number} page - Page number
 * @returns {Promise} - Promise with TV shows
 */
export function getTVShowsByYear(year, page = 1) {
  return fetchFromAPI("/discover/tv", { first_air_date_year: year, page });
}

/**
 * Get image URL
 * @param {string} path - Image path
 * @param {string} size - Image size
 * @returns {string} - Full image URL
 */
export function getImageUrl(path, size = POSTER_SIZE) {
  if (!path) {
    return "https://via.placeholder.com/500x750?text=No+Image+Available";
  }
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get backdrop URL
 * @param {string} path - Backdrop path
 * @returns {string} - Full backdrop URL
 */
export function getBackdropUrl(path) {
  if (!path) {
    return "https://via.placeholder.com/1280x720?text=No+Backdrop+Available";
  }
  return `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${path}`;
}

/**
 * Get profile URL
 * @param {string} path - Profile path
 * @returns {string} - Full profile URL
 */
export function getProfileUrl(path) {
  if (!path) {
    return "https://via.placeholder.com/185x278?text=No+Profile+Available";
  }
  return `${IMAGE_BASE_URL}/${PROFILE_SIZE}${path}`;
}

export default {
  getMovieGenres,
  getTVGenres,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  getTVShowsAiringToday,
  getTVShowsOnTheAir,
  getMovieDetails,
  getTVShowDetails,
  searchMulti,
  searchMovies,
  searchTVShows,
  getMoviesByGenre,
  getTVShowsByGenre,
  getMoviesByYear,
  getTVShowsByYear,
  getImageUrl,
  getBackdropUrl,
  getProfileUrl,
};
