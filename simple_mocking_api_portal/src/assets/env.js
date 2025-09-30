// Runtime environment configuration for Docker deployments
// This file can be replaced at runtime with actual environment variables
(function(window) {
  window.env = window.env || {};

  // Environment variables
  window.env.API_URL = '${API_URL}';
  window.env.ENABLE_TOAST = '${ENABLE_TOAST}';
  window.env.ENABLE_PAGINATION = '${ENABLE_PAGINATION}';
  window.env.DEFAULT_PAGE_SIZE = '${DEFAULT_PAGE_SIZE}';
})(this);
