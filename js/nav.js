// Handles header compaction and podcast platform drawer behavior
(function () {
  const nav = document.querySelector('.nav');
  const body = document.body;
  if (!nav || !body) return;

  const isHome = body.classList.contains('page-home');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const getThreshold = (isMobile) => (isMobile ? 220 : 80);
  let threshold = getThreshold(mobileQuery.matches);
  let lastScrollY = window.scrollY;
  let ticking = false;
  const platformToggle = nav.querySelector('.nav__platform-toggle');
  const menuToggle = nav.querySelector('.nav__menu-toggle');
  const navLinks = nav.querySelector('.nav__links');

  const closePlatforms = () => {
    nav.classList.remove('nav--platforms-open');
    if (platformToggle) {
      platformToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const closeMenu = () => {
    nav.classList.remove('nav--menu-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const applyCompactState = () => {
    const shouldCompact = !isHome || lastScrollY > threshold;
    nav.classList.toggle('nav--compact', shouldCompact);
    if (!shouldCompact) {
      closePlatforms();
    }
    ticking = false;
  };

  if (platformToggle) {
    platformToggle.addEventListener('click', () => {
      closeMenu();
      const expanded = platformToggle.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      platformToggle.setAttribute('aria-expanded', String(next));
      nav.classList.toggle('nav--platforms-open', next);
    });
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      menuToggle.setAttribute('aria-expanded', String(next));
      if (next) {
        closePlatforms();
      }
      nav.classList.toggle('nav--menu-open', next);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileQuery.matches) {
          closeMenu();
        }
      });
    });
  }

  const onScroll = () => {
    if (!isHome) return;
    lastScrollY = window.scrollY;
    if (ticking) return;
    window.requestAnimationFrame(applyCompactState);
    ticking = true;
  };

  const onViewportChange = () => {
    threshold = getThreshold(mobileQuery.matches);
    if (!mobileQuery.matches) {
      closeMenu();
    }
    if (isHome) {
      applyCompactState();
    }
  };

  applyCompactState();
  if (isHome) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', onViewportChange);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(onViewportChange);
  }

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(onViewportChange);
  });
})();
