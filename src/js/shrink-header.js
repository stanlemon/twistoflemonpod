// Shrink header image on scroll (for non-homepage pages only)
(function() {
  'use strict';

  // Only run on non-homepage pages
  if (document.body.classList.contains('homepage')) {
    return;
  }

  const nav = document.querySelector('.nav');
  const logo = document.querySelector('.logo');

  if (!nav || !logo) {
    return;
  }

  let ticking = false;
  const shrinkThreshold = 50; // Start shrinking after 50px of scroll

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrollY = window.scrollY;
        const shouldShrink = scrollY > shrinkThreshold;

        if (shouldShrink) {
          nav.classList.add('shrink');
          logo.classList.add('shrink');
        } else {
          nav.classList.remove('shrink');
          logo.classList.remove('shrink');
        }

        ticking = false;
      });

      ticking = true;
    }
  }

  // Listen for scroll events
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Set initial state immediately (before page has scrolled)
  if (window.scrollY > shrinkThreshold) {
    nav.classList.add('shrink');
    logo.classList.add('shrink');
  }
})();
