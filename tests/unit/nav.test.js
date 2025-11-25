import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

const createClassList = (initial = []) => {
  const set = new Set(initial);
  return {
    add: (cls) => set.add(cls),
    remove: (cls) => set.delete(cls),
    toggle: (cls, force) => {
      if (force === undefined) {
        return set.has(cls) ? (set.delete(cls), false) : (set.add(cls), true);
      }
      return force ? (set.add(cls), true) : (set.delete(cls), false);
    },
    contains: (cls) => set.has(cls),
    toArray: () => Array.from(set),
  };
};

const createElement = (classNames = "") => {
  const listeners = {};
  const classList = createClassList(classNames.split(" ").filter(Boolean));
  const attributes = {};
  return {
    classList,
    listeners,
    setAttribute: (name, value) => {
      attributes[name] = value;
    },
    getAttribute: (name) => attributes[name] ?? null,
    addEventListener: (type, cb) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(cb);
    },
    dispatch: (type) => {
      (listeners[type] || []).forEach((cb) => cb());
    },
  };
};

const createNavDom = ({ isHome = true, mobileMatches = false } = {}) => {
  const nav = createElement("nav");

  const platformToggle = createElement();
  const menuToggle = createElement();
  const navLinks = createElement();
  const links = [createElement(), createElement()];
  navLinks.querySelectorAll = () => links;

  nav.querySelector = (selector) => {
    if (selector === ".nav__platform-toggle") return platformToggle;
    if (selector === ".nav__menu-toggle") return menuToggle;
    if (selector === ".nav__links") return navLinks;
    return null;
  };

  const mobileQuery = {
    matches: mobileMatches,
    listeners: [],
    addEventListener(type, cb) {
      if (type === "change") this.listeners.push(cb);
    },
    addListener(cb) {
      this.listeners.push(cb);
    },
    trigger(next) {
      this.matches = next;
      this.listeners.forEach((cb) => cb({ matches: next }));
    },
  };

  const windowListeners = {};
  const window = {
    scrollY: 0,
    innerWidth: mobileMatches ? 400 : 1024,
    matchMedia: () => mobileQuery,
    requestAnimationFrame: (cb) => {
      return setTimeout(cb, 0);
    },
    addEventListener: (type, cb) => {
      windowListeners[type] = windowListeners[type] || [];
      windowListeners[type].push(cb);
    },
    dispatchEvent: (type) => {
      (windowListeners[type] || []).forEach((cb) => cb());
    },
  };

  const body = {
    classList: createClassList(isHome ? ["page-home"] : []),
  };

  const document = {
    body,
    querySelector: (selector) => {
      if (selector === ".nav") return nav;
      return null;
    },
  };

  return {
    nav,
    platformToggle,
    menuToggle,
    navLinks,
    links,
    mobileQuery,
    window,
    document,
  };
};

const importNavScript = async () => {
  // Cache-bust to trigger IIFE each test
  await import(`../../src/js/nav.js?cache=${Date.now()}`);
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  globalThis.window = undefined;
  globalThis.document = undefined;
});

afterEach(() => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});

test("nav toggles compact state after scroll threshold on home", async () => {
  const ctx = createNavDom({ isHome: true, mobileMatches: false });
  globalThis.window = ctx.window;
  globalThis.document = ctx.document;

  await importNavScript();

  assert.equal(ctx.nav.classList.contains("nav--compact"), false);

  ctx.window.scrollY = 200;
  ctx.window.dispatchEvent("scroll");
  await flush();
  assert.equal(ctx.nav.classList.contains("nav--compact"), true);

  ctx.window.scrollY = 0;
  ctx.window.dispatchEvent("scroll");
  await flush();
  assert.equal(ctx.nav.classList.contains("nav--compact"), false);
});

test("mobile menu closes on link click and on viewport change", async () => {
  const ctx = createNavDom({ isHome: true, mobileMatches: true });
  globalThis.window = ctx.window;
  globalThis.document = ctx.document;

  // Pre-open menu
  ctx.nav.classList.add("nav--menu-open");
  ctx.menuToggle.setAttribute("aria-expanded", "true");

  await importNavScript();

  // Click any nav link on mobile
  const [firstLink] = ctx.links;
  firstLink.dispatch("click");
  assert.equal(ctx.nav.classList.contains("nav--menu-open"), false);
  assert.equal(ctx.menuToggle.getAttribute("aria-expanded"), "false");

  // Re-open and then trigger breakpoint change to desktop
  ctx.nav.classList.add("nav--menu-open");
  ctx.menuToggle.setAttribute("aria-expanded", "true");
  ctx.mobileQuery.trigger(false);
  assert.equal(ctx.nav.classList.contains("nav--menu-open"), false);
  assert.equal(ctx.menuToggle.getAttribute("aria-expanded"), "false");
});
