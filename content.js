function collectContentEntries(node, entries) {
  if (!node || typeof node !== "object") return;

  if (
    typeof node.selector === "string" &&
    Object.prototype.hasOwnProperty.call(node, "value")
  ) {
    entries.push({ selector: node.selector, value: node.value });
    return;
  }

  if (Array.isArray(node)) {
    node.forEach(function (item) {
      collectContentEntries(item, entries);
    });
    return;
  }

  Object.values(node).forEach(function (item) {
    collectContentEntries(item, entries);
  });
}

function applyContent(contentTree) {
  const entries = [];
  collectContentEntries(contentTree, entries);

  entries.forEach(function (entry) {
    const element = document.querySelector(entry.selector);
    if (!element) return;

    if (element.tagName === "META") {
      element.setAttribute("content", String(entry.value));
      return;
    }

    element.innerHTML = String(entry.value);
  });
}

async function loadContent() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load content.json");
    }

    const contentTree = await response.json();
    applyContent(contentTree);
  } catch (error) {
    console.error("Content loading error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadContent);
} else {
  loadContent();
}
