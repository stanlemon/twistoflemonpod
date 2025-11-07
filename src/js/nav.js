// Handles header compaction and podcast platform drawer behavior
(function () {
  const nav = document.querySelector('.nav');
  const body = document.body;
  if (!nav || !body) return;

  const isHome = body.classList.contains('page-home');
  const getThreshold = () => (window.innerWidth < 768 ? 220 : 80);
  let threshold = getThreshold();
  const platformToggle = nav.querySelector('.nav__platform-toggle');

  const closePlatforms = () => {
    nav.classList.remove('nav--platforms-open');
    if (platformToggle) {
      platformToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const toggleCompact = () => {
    if (!isHome || window.scrollY > threshold) {
      nav.classList.add('nav--compact');
    } else {
      nav.classList.remove('nav--compact');
      closePlatforms();
    }
  };

  if (platformToggle) {
    platformToggle.addEventListener('click', () => {
      const expanded = platformToggle.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      platformToggle.setAttribute('aria-expanded', String(next));
      nav.classList.toggle('nav--platforms-open', next);
    });
  }

  toggleCompact();
  if (isHome) {
    window.addEventListener('scroll', toggleCompact, { passive: true });
    window.addEventListener('resize', () => {
      threshold = getThreshold();
      toggleCompact();
    });
  }
})();
