(function () {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search || "");
  let hasUtmParams = false;

  for (const key of params.keys()) {
    if (key && key.toLowerCase().startsWith("utm_")) {
      hasUtmParams = true;
      break;
    }
  }

  if (!hasUtmParams) {
    return;
  }

  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]');

  if (canonicalLink) {
    canonicalLink.setAttribute("href", cleanUrl);
  } else {
    canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    canonicalLink.setAttribute("href", cleanUrl);
    document.head.appendChild(canonicalLink);
  }

  const desiredRobotsValue = "noindex,follow";
  let robotsMeta = document.querySelector('meta[name="robots"]');

  if (robotsMeta) {
    const content = (robotsMeta.getAttribute("content") || "").toLowerCase();
    if (!content.includes("noindex")) {
      robotsMeta.setAttribute("content", desiredRobotsValue);
    } else if (!content.includes("follow")) {
      robotsMeta.setAttribute("content", "noindex,follow");
    }
  } else {
    robotsMeta = document.createElement("meta");
    robotsMeta.setAttribute("name", "robots");
    robotsMeta.setAttribute("content", desiredRobotsValue);
    document.head.appendChild(robotsMeta);
  }
})();
