/**
 * Auth Module
 * Handles user authentication with localStorage
 */

import { showToast } from './utils.js';

// User storage key
const USER_KEY = 'idlix_user';

/**
 * Register a new user
 * @param {Object} userData - User data to register
 * @returns {boolean} - Success status
 */
export function registerUser(userData) {
  // Validate user data
  if (!userData.username || !userData.email || !userData.password) {
    return false;
  }
  
  // Check if user already exists
  const existingUsers = getUsers();
  const userExists = existingUsers.some(user => 
    user.email.toLowerCase() === userData.email.toLowerCase() ||
    user.username.toLowerCase() === userData.username.toLowerCase()
  );
  
  if (userExists) {
    return false;
  }
  
  // Create a new user object
  const newUser = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email.toLowerCase(),
    password: userData.password, // In a real app, this should be hashed
    createdAt: new Date().toISOString()
  };
  
  // Add the new user to the users array
  existingUsers.push(newUser);
  
  // Save the updated users array
  localStorage.setItem('idlix_users', JSON.stringify(existingUsers));
  
  return true;
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object|null} - User data if login successful, null otherwise
 */
export function loginUser(email, password) {
  // Get all users
  const users = getUsers();
  
  // Find the user with the given email and password
  const user = users.find(user => 
    user.email.toLowerCase() === email.toLowerCase() && 
    user.password === password
  );
  
  if (!user) {
    return null;
  }
  
  // Create a session object
  const session = {
    userId: user.id,
    username: user.username,
    email: user.email,
    loggedInAt: new Date().toISOString()
  };
  
  // Save the session to localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(session));
  
  return session;
}

/**
 * Logout the current user
 */
export function logoutUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the current logged in user
 * @returns {Object|null} - Current user data if logged in, null otherwise
 */
export function getCurrentUser() {
  const userData = localStorage.getItem(USER_KEY);
  
  if (!userData) {
    return null;
  }
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Check if a user is logged in
 * @returns {boolean} - Whether a user is logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Get all registered users
 * @returns {Array} - Array of all users
 */
function getUsers() {
  const usersData = localStorage.getItem('idlix_users');
  
  if (!usersData) {
    return [];
  }
  
  try {
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error parsing users data:', error);
    return [];
  }
}

// Initialize auth module
function init() {
  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const user = loginUser(email, password);
      
      if (user) {
        window.location.href = 'index.html';
      } else {
        const errorElement = document.getElementById('loginError');
        errorElement.textContent = 'Invalid email or password';
        errorElement.classList.remove('hidden');
      }
    });
  }
  
  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      const errorElement = document.getElementById('registerError');
      
      // Validate inputs
      if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        errorElement.classList.remove('hidden');
        return;
      }
      
      // Register the user
      const success = registerUser({ username, email, password });
      
      if (success) {
        window.location.href = 'login.html?registered=true';
      } else {
        errorElement.textContent = 'Username or email already exists';
        errorElement.classList.remove('hidden');
      }
    });
  }
  
  // Check for registered success message
  if (window.location.href.includes('login.html?registered=true')) {
    showToast('Registration successful! Please login.');
  }
  
  // Update UI based on auth state
  updateUIForAuthState();
}

/**
 * Update the UI based on authentication state
 */
export function updateUIForAuthState() {
  const loginButton = document.getElementById('loginButton');
  const userDropdown = document.getElementById('userDropdown');
  const usernameElement = document.getElementById('username');
  const logoutButton = document.getElementById('logoutButton');
  
  if (!loginButton || !userDropdown) {
    return;
  }
  
  const user = getCurrentUser();
  
  if (user) {
    loginButton.classList.add('hidden');
    userDropdown.classList.remove('hidden');
    
    if (usernameElement) {
      usernameElement.textContent = user.username;
    }
    
    if (logoutButton) {
      logoutButton.addEventListener('click', function(event) {
        event.preventDefault();
        logoutUser();
        window.location.href = 'index.html';
      });
    }
  } else {
    loginButton.classList.remove('hidden');
    userDropdown.classList.add('hidden');
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isLoggedIn,
  updateUIForAuthState
};