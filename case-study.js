function initCaseSectionControls() {
  const list = document.getElementById("case-study-list");
  if (!list) return;

  list.addEventListener("click", function (event) {
    const button = event.target.closest(".case-toggle-btn");
    if (!button) return;

    const card = button.closest(".case-study-card");
    if (!card) return;

    const sections = card.querySelectorAll(".case-section");
    const action = button.getAttribute("data-action");
    const shouldOpen = action === "expand-all";

    sections.forEach(function (section) {
      section.open = shouldOpen;
    });
  });
}

function initCaseImageOverlay() {
  const list = document.getElementById("case-study-list");
  if (!list) return;

  const overlay = document.createElement("div");
  overlay.className = "case-image-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = [
    '<div class="case-image-overlay-panel" role="dialog" aria-modal="true" aria-label="Expanded image view">',
    '  <button type="button" class="case-image-close" aria-label="Close image preview">x</button>',
    '  <img class="case-image-overlay-img" alt="" />',
    '  <p class="case-image-overlay-title"></p>',
    "</div>",
  ].join("");
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector(".case-image-overlay-img");
  const overlayTitle = overlay.querySelector(".case-image-overlay-title");
  const closeBtn = overlay.querySelector(".case-image-close");
  let isOpen = false;

  function closeOverlay() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-overlay-open");
  }

  function openOverlay(targetImage) {
    if (!targetImage) return;
    overlayImg.src = targetImage.currentSrc || targetImage.src || "";
    overlayImg.alt = targetImage.alt || "Expanded case image";
    overlayTitle.textContent = targetImage.getAttribute("data-image-title") || "";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-overlay-open");
    isOpen = true;
  }

  list.addEventListener("click", function (event) {
    const expandBtn = event.target.closest(".case-image-expand-btn");
    if (expandBtn) {
      const card = expandBtn.closest(".case-image-card");
      const img = card ? card.querySelector(".case-image") : null;
      if (!img) return;
      event.preventDefault();
      openOverlay(img);
      return;
    }

    const img = event.target.closest(".case-image");
    if (!img) return;
    event.preventDefault();
    openOverlay(img);
  });

  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeOverlay();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeOverlay();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initCaseSectionControls();
    initCaseImageOverlay();
  });
} else {
  initCaseSectionControls();
  initCaseImageOverlay();
}
