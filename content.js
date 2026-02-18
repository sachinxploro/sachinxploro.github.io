function applyContent(contentMap) {
  Object.entries(contentMap).forEach(function ([selector, value]) {
    const element = document.querySelector(selector);
    if (!element) return;

    if (element.tagName === "META") {
      element.setAttribute("content", String(value));
      return;
    }

    element.innerHTML = String(value);
  });
}

async function loadContent() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load content.json");
    }

    const contentMap = await response.json();
    applyContent(contentMap);
  } catch (error) {
    console.error("Content loading error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadContent);
} else {
  loadContent();
}
