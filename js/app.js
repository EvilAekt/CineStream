/**
 * Main application script for IDLIX Movie Streaming Website
 */

import * as api from "./api.js";
import { createMovieCard, setupMobileMenu, setupSearch } from "./utils.js";
import { updateUIForAuthState } from "./auth.js";

/**
 * Initialize the application
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

  // Fill year dropdown
  fillYearDropdown();

  // Load featured content
  await loadFeaturedContent();

  // Load popular movies
  await loadPopularMovies();

  // Load popular TV shows
  await loadPopularTVShows();

  // Setup movie modal
  setupMovieModal();
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
    tvGenres.genres.forEach((tvGenre) => {
      if (!uniqueGenres.some((g) => g.id === tvGenre.id)) {
        uniqueGenres.push(tvGenre);
      }
    });

    // Sort genres by name
    uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));

    // Fill genre dropdowns
    fillGenreDropdown(uniqueGenres);
  } catch (error) {
    console.error("Error loading genres:", error);
  }
}

/**
 * Fill genre dropdown menus
 * @param {Array} genres - Array of genre objects
 */
function fillGenreDropdown(genres) {
  const genreDropdown = document.getElementById("genreDropdown");
  const mobileGenreMenu = document.getElementById("mobileGenreMenu");

  if (!genreDropdown || !genres.length) return;

  // Clear loading message
  genreDropdown.innerHTML = "";

  // Add genres to dropdown
  genres.forEach((genre) => {
    const link = document.createElement("a");
    link.href = `movies.html?genre=${genre.id}`;
    link.className = "block px-4 py-2 hover:bg-gray-700";
    link.textContent = genre.name;

    genreDropdown.appendChild(link);

    // Add to mobile menu if it exists
    if (mobileGenreMenu) {
      const mobileLink = link.cloneNode(true);
      mobileLink.className = "block py-2 text-gray-300 hover:text-white";
      mobileGenreMenu.appendChild(mobileLink);
    }
  });
}

/**
 * Fill year dropdown menus
 */
function fillYearDropdown() {
  const yearDropdown = document.getElementById("yearDropdown");
  const mobileYearMenu = document.getElementById("mobileYearMenu");

  if (!yearDropdown) return;

  // Get current year
  const currentYear = new Date().getFullYear();

  // Generate years (current year down to 2000)
  for (let year = currentYear; year >= 2000; year--) {
    const link = document.createElement("a");
    link.href = `movies.html?year=${year}`;
    link.className = "block px-4 py-2 hover:bg-gray-700";
    link.textContent = year;

    yearDropdown.appendChild(link);

    // Add to mobile menu if it exists
    if (mobileYearMenu) {
      const mobileLink = link.cloneNode(true);
      mobileLink.className = "block py-2 text-gray-300 hover:text-white";
      mobileYearMenu.appendChild(mobileLink);
    }
  }
}

/**
 * Load featured content
 */
async function loadFeaturedContent() {
  try {
    // Get trending content using the api module
    const trendingData = await api.searchMulti("", 1);

    // Get container
    const featuredContainer = document.getElementById("featuredMovies");
    if (!featuredContainer) return;

    // Clear loading placeholders
    featuredContainer.innerHTML = "";

    // Display up to 6 featured items
    const featuredItems = trendingData.results.slice(0, 6);

    featuredItems.forEach((item) => {
      const card = createMovieCard(item, true); // true for featured
      featuredContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading featured content:", error);
  }
}

/**
 * Load popular movies
 */
async function loadPopularMovies() {
  try {
    const popularMoviesData = await api.getPopularMovies();

    // Get container
    const moviesContainer = document.getElementById("popularMovies");
    if (!moviesContainer) return;

    // Clear loading placeholders
    moviesContainer.innerHTML = "";

    // Display up to 6 popular movies
    const movies = popularMoviesData.results.slice(0, 6);

    movies.forEach((movie) => {
      // Add movie_type for identification
      movie.media_type = "movie";

      const card = createMovieCard(movie);
      moviesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading popular movies:", error);
  }
}

/**
 * Load popular TV shows
 */
async function loadPopularTVShows() {
  try {
    const popularTVData = await api.getPopularTVShows();

    // Get container
    const tvContainer = document.getElementById("popularTVShows");
    if (!tvContainer) return;

    // Clear loading placeholders
    tvContainer.innerHTML = "";

    // Display up to 6 popular TV shows
    const shows = popularTVData.results.slice(0, 6);

    shows.forEach((show) => {
      // Add media_type for identification
      show.media_type = "tv";

      const card = createMovieCard(show);
      tvContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading popular TV shows:", error);
  }
}

/**
 * Setup movie modal
 */
function setupMovieModal() {
  const modal = document.getElementById("movieModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");

  if (!modal || !modalContent || !closeModal) return;

  // Close modal when clicking the close button
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside the content
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  // Close modal when pressing Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });

  // Open modal when clicking on a movie card
  document.addEventListener("click", async (event) => {
    // Find the closest movie card ancestor
    const card = event.target.closest(".movie-card");

    if (!card) return;

    // Prevent default behavior if it's a link
    event.preventDefault();

    const id = card.dataset.id;
    const type = card.dataset.type;

    if (!id || !type) return;

    // Show loading state
    modalContent.innerHTML = `
      <div class="animate-pulse">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/3">
            <div class="bg-gray-800 rounded h-96"></div>
          </div>
          <div class="md:w-2/3 md:pl-6 mt-4 md:mt-0">
            <div class="bg-gray-800 h-8 rounded w-3/4"></div>
            <div class="bg-gray-800 h-4 rounded mt-4 w-1/2"></div>
            <div class="bg-gray-800 h-4 rounded mt-2 w-full"></div>
            <div class="bg-gray-800 h-4 rounded mt-1 w-full"></div>
            <div class="bg-gray-800 h-4 rounded mt-1 w-3/4"></div>
            <div class="bg-gray-800 h-4 rounded mt-6 w-1/4"></div>
            <div class="bg-gray-800 h-24 rounded mt-2 w-full"></div>
          </div>
        </div>
      </div>
    `;

    // Show modal
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    try {
      let details;

      // Fetch details based on type
      if (type === "movie") {
        details = await api.getMovieDetails(id);
      } else if (type === "tv") {
        details = await api.getTVShowDetails(id);
      } else {
        throw new Error("Unknown media type");
      }

      // Update modal content
      updateModalContent(details, type);
    } catch (error) {
      console.error("Error loading details:", error);
      modalContent.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
          <h3 class="text-xl font-bold mb-2">Error Loading Content</h3>
          <p class="text-gray-400">There was a problem loading the details. Please try again later.</p>
        </div>
      `;
    }
  });
}

/**
 * Update modal content with movie or TV show details
 * @param {Object} details - Movie or TV show details
 * @param {string} type - Media type (movie or tv)
 */
function updateModalContent(details, type) {
  const modalContent = document.getElementById("modalContent");
  if (!modalContent) return;

  const title = type === "movie" ? details.title : details.name;
  const releaseDate =
    type === "movie" ? details.release_date : details.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
  const runtime =
    type === "movie"
      ? formatRuntime(details.runtime)
      : details.episode_run_time && details.episode_run_time.length
      ? formatRuntime(details.episode_run_time[0]) + " per episode"
      : "N/A";

  const posterPath = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const genres = details.genres.map((genre) => genre.name).join(", ");

  const overview = details.overview || "No overview available";

  const rating = details.vote_average
    ? `${(details.vote_average * 10).toFixed(0)}% (${details.vote_count} votes)`
    : "Not rated";

  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3">
        <img src="${posterPath}" alt="${title}" class="w-full rounded-lg shadow-lg">
      </div>
      <div class="md:w-2/3 md:pl-6 mt-4 md:mt-0">
        <h2 class="text-2xl font-bold">${title} <span class="text-gray-400">(${year})</span></h2>
        
        <div class="flex flex-wrap mt-2">
          ${genres
            .split(", ")
            .map(
              (genre) => `<span class="genre-pill mr-2 mb-2">${genre}</span>`
            )
            .join("")}
        </div>
        
        <div class="mt-4 text-sm">
          <p><strong>Rating:</strong> <span class="text-yellow-500">${rating}</span></p>
          <p><strong>Runtime:</strong> ${runtime}</p>
          ${
            type === "tv"
              ? `<p><strong>Seasons:</strong> ${
                  details.number_of_seasons || "N/A"
                }</p>`
              : ""
          }
        </div>
        
        <div class="mt-6">
          <h3 class="text-lg font-semibold mb-2">Overview</h3>
          <p class="text-gray-300">${overview}</p>
        </div>
        
        <div class="mt-6">
          <a href="${
            type === "movie"
              ? `movie-details.html?id=${details.id}`
              : `tv-details.html?id=${details.id}`
          }" 
             class="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300">
            <i class="fas fa-info-circle mr-2"></i>View Details
          </a>
          <button class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded ml-2 transition duration-300">
            <i class="fas fa-play mr-2"></i>Watch Now
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format runtime as hours and minutes
 * @param {number} minutes - Runtime in minutes
 * @returns {string} - Formatted runtime (e.g. "2h 15m")
 */
function formatRuntime(minutes) {
  if (!minutes) return "N/A";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (mins > 0) result += `${mins}m`;

  return result.trim();
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);
