function readToolValue(item, key, fallback) {
  const node = item && item[key];
  if (!node) return fallback;

  if (typeof node === "string") return node;
  if (typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "value")) {
    return node.value;
  }

  return fallback;
}

async function loadTools() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) return;

    const content = await response.json();
    const items = content?.tools?.items;
    const grid = document.getElementById("tools-grid");
    if (!grid || !Array.isArray(items)) return;

    grid.innerHTML = "";

    items.forEach(function (item) {
      const label = String(readToolValue(item, "label", "") || "");
      const logoSrc = String(readToolValue(item, "logoSrc", "") || "");
      const logoAlt = String(readToolValue(item, "logoAlt", label + " logo") || "");

      const card = document.createElement("div");
      card.className = "tool";

      const img = document.createElement("img");
      img.className = "tool-logo";
      img.src = logoSrc;
      img.alt = logoAlt;

      const text = document.createElement("span");
      text.textContent = label;

      card.appendChild(img);
      card.appendChild(text);
      grid.appendChild(card);
    });
  } catch (error) {
    console.error("Tools loading error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTools);
} else {
  loadTools();
}
