let toolsFlipTimer = null;

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
    if (toolsFlipTimer) {
      clearInterval(toolsFlipTimer);
      toolsFlipTimer = null;
    }

    items.forEach(function (item) {
      const label = String(readToolValue(item, "label", "") || "");
      const logoSrc = String(readToolValue(item, "logoSrc", "") || "");
      const logoAlt = String(readToolValue(item, "logoAlt", label + " logo") || "");
      const brandInfo = String(
        readToolValue(item, "brandInfo", "Microsoft service for business process digitization.")
      );

      const card = document.createElement("div");
      card.className = "tool";

      const inner = document.createElement("div");
      inner.className = "tool-inner";

      const front = document.createElement("div");
      front.className = "tool-face tool-front";

      const img = document.createElement("img");
      img.className = "tool-logo";
      img.src = logoSrc;
      img.alt = logoAlt;

      const text = document.createElement("span");
      text.textContent = label;

      front.appendChild(img);
      front.appendChild(text);

      const back = document.createElement("div");
      back.className = "tool-face tool-back";
      const backText = document.createElement("p");
      backText.textContent = brandInfo;
      back.appendChild(backText);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      grid.appendChild(card);
    });

    const cards = Array.from(grid.querySelectorAll(".tool"));
    if (cards.length > 0) {
      let activeIndex = 0;
      toolsFlipTimer = setInterval(function () {
        const activeCard = cards[activeIndex];
        activeCard.classList.add("is-flipped");

        setTimeout(function () {
          activeCard.classList.remove("is-flipped");
        }, 1800);

        activeIndex = (activeIndex + 1) % cards.length;
      }, 4000);
    }
  } catch (error) {
    console.error("Tools loading error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadTools);
} else {
  loadTools();
}
