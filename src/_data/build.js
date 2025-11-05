/**
 * Build-time data
 * Provides the current date/time when the site is built
 */
export default {
  // Current build timestamp as a Date object
  timestamp: new Date(),

  // Environment info
  env: process.env.NODE_ENV || 'development'
};
