// Theme toggle functionality
(function () {
  const STORAGE_KEY = 'theme-preference';

  // Get theme from localStorage or system preference
  function getThemePreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  // Apply theme to document
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  // Initialize theme on page load
  const currentTheme = getThemePreference();
  applyTheme(currentTheme);

  // Wait for DOM to be ready to attach event listener
  document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('theme-toggle');

    if (toggleButton) {
      toggleButton.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        applyTheme(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
      });
    }
  });

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
})();
