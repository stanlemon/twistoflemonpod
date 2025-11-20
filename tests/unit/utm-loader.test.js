import { test } from "node:test";
import assert from "node:assert/strict";

const runLoader = (search) => {
  const appended = [];
  const document = {
    head: {
      appendChild: (node) => appended.push(node),
    },
    createElement: () => ({ src: "", defer: false }),
  };

  const location = { search };

  (function (doc, loc) {
    if (!loc.search || loc.search.toLowerCase().indexOf("utm_") === -1) return;
    const s = doc.createElement("script");
    s.src = "/js/utm-canonical.js";
    s.defer = true;
    doc.head.appendChild(s);
  })(document, location);

  return appended;
};

test("UTM loader skips when no UTM params are present", () => {
  const appended = runLoader("");
  assert.equal(appended.length, 0);
});

test("UTM loader injects script when UTM params are present", () => {
  const [node] = runLoader("?utm_source=newsletter&ref=test");
  assert.ok(node, "script node should be appended");
  assert.equal(node.src, "/js/utm-canonical.js");
  assert.equal(node.defer, true);
});
