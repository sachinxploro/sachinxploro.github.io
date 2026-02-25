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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectCaseEntries() {
  const entries = [];
  const usedIds = new Set();
  const sections = document.querySelectorAll("#case-study-list .customer-section");

  sections.forEach(function (section, sectionIndex) {
    const customerName =
      section.querySelector(".customer-name")?.textContent.trim() ||
      `Customer ${sectionIndex + 1}`;
    const items = section.querySelectorAll(".carousel-item");

    items.forEach(function (item, itemIndex) {
      const caseTitle =
        item.querySelector(".case-story-title")?.textContent.trim() ||
        `${customerName} case study ${itemIndex + 1}`;

      const baseId = `case-${slugify(customerName)}-${slugify(caseTitle)}`.slice(
        0,
        120,
      );
      let id = baseId || `case-${sectionIndex + 1}-${itemIndex + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix++}`;
      }
      usedIds.add(id);

      item.id = id;
      item.setAttribute("data-case-title", caseTitle);
      item.setAttribute("data-case-index", String(itemIndex));
      entries.push({
        id: id,
        title: caseTitle,
        customerName: customerName,
        section: section,
        item: item,
        itemIndex: itemIndex,
      });
    });
  });

  return entries;
}

function activateCarouselIndicator(entry) {
  const dots = entry.section.querySelectorAll(".c-indicator");
  dots.forEach(function (dot, dotIndex) {
    dot.classList.toggle("active", dotIndex === entry.itemIndex);
  });
}

function scrollToCaseEntry(entry, updateHash) {
  if (!entry || !entry.item || !entry.section) return;
  const track = entry.item.closest(".carousel-track");

  entry.section.scrollIntoView({ behavior: "smooth", block: "start" });

  if (track) {
    track.scrollTo({
      left: entry.item.offsetLeft,
      behavior: "smooth",
    });
  }

  activateCarouselIndicator(entry);

  if (updateHash) {
    history.replaceState(null, "", `#${entry.id}`);
  }
}

function initCaseStudyBrowseModal() {
  const browseBtn = document.getElementById("caseBrowseBtn");
  const list = document.getElementById("case-study-list");
  if (!browseBtn || !list) return;

  const entries = collectCaseEntries();
  if (!entries.length) {
    browseBtn.style.display = "none";
    return;
  }

  const modal = document.createElement("div");
  modal.className = "case-picker-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = [
    '<div class="case-picker-panel" role="dialog" aria-modal="true" aria-label="Browse case studies">',
    '  <div class="case-picker-head"><h3>Browse Case Studies</h3><button type="button" class="case-picker-close" aria-label="Close case study list">x</button></div>',
    '  <div class="case-picker-list"></div>',
    "</div>",
  ].join("");
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector(".case-picker-close");
  const listWrap = modal.querySelector(".case-picker-list");

  entries.forEach(function (entry) {
    const link = document.createElement("button");
    link.type = "button";
    link.className = "case-picker-item";
    link.innerHTML = `<span class="case-picker-item-title">${entry.title}</span><span class="case-picker-item-sub">${entry.customerName}</span>`;
    link.addEventListener("click", function () {
      closeModal();
      scrollToCaseEntry(entry, true);
    });
    listWrap.appendChild(link);
  });

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-overlay-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-overlay-open");
  }

  browseBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeModal();
  });

  if (window.location.hash) {
    const hashId = window.location.hash.replace(/^#/, "");
    const matched = entries.find(function (entry) {
      return entry.id === hashId;
    });
    if (matched) {
      window.setTimeout(function () {
        scrollToCaseEntry(matched, false);
      }, 120);
    }
  }
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
    initCaseStudyBrowseModal();
    initCaseImageOverlay();
  });
} else {
  initCaseSectionControls();
  initCaseStudyBrowseModal();
  initCaseImageOverlay();
}
