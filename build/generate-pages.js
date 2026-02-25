const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "content.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const CASE_ITEMS_TOKEN = "<!--CASE_STUDY_ITEMS-->";

function collectContentEntries(node, entries) {
  if (!node || typeof node !== "object") return;

  if (
    typeof node.selector === "string" &&
    Object.prototype.hasOwnProperty.call(node, "value")
  ) {
    entries.push({
      selector: node.selector,
      value: node.value,
      attribute: typeof node.attribute === "string" ? node.attribute : null,
    });
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => collectContentEntries(item, entries));
    return;
  }

  Object.values(node).forEach((item) => collectContentEntries(item, entries));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setAttributeOnTag(openTag, attribute, value) {
  const attrRegex = new RegExp(
    `\\s${escapeRegExp(attribute)}=("[^"]*"|'[^']*')`,
    "i",
  );
  const safeValue = String(value).replace(/"/g, "&quot;");

  if (attrRegex.test(openTag)) {
    return openTag.replace(attrRegex, ` ${attribute}="${safeValue}"`);
  }

  return openTag.replace(/>$/, ` ${attribute}="${safeValue}">`);
}

function applyEntryToHtml(html, entry) {
  if (!entry.selector || !entry.selector.startsWith("#")) return html;

  const id = entry.selector.slice(1);
  if (!id) return html;

  const openTagPattern = new RegExp(
    `(<[a-zA-Z][a-zA-Z0-9:-]*[^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*>)`,
    "i",
  );

  if (entry.attribute) {
    return html.replace(openTagPattern, (fullTag) =>
      setAttributeOnTag(fullTag, entry.attribute, entry.value),
    );
  }

  const metaPattern = new RegExp(
    `(<meta[^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*>)`,
    "i",
  );
  if (metaPattern.test(html)) {
    return html.replace(metaPattern, (fullTag) =>
      setAttributeOnTag(fullTag, "content", entry.value),
    );
  }

  const elementPattern = new RegExp(
    `(<([a-zA-Z][a-zA-Z0-9:-]*)[^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*>)([\\s\\S]*?)(</\\2>)`,
    "i",
  );

  return html.replace(elementPattern, `$1${String(entry.value)}$4`);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toImageTitle(src, index) {
  if (!src) return `Image ${index + 1}`;

  try {
    const raw = String(src);
    const lastPath = raw.split("/").pop() || raw;
    const withoutQuery = lastPath.split("?")[0];
    const decoded = decodeURIComponent(withoutQuery);
    const clean = decoded.replace(/\.[a-zA-Z0-9]+$/, "");
    const normalized = clean.replace(/[-_]+/g, " ").trim();
    if (!normalized) return `Image ${index + 1}`;
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  } catch (_) {
    return `Image ${index + 1}`;
  }
}

function getYouTubeEmbedUrl(value) {
  if (!value) return null;

  const raw = String(value).trim();
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com")) {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (url.pathname.startsWith("/embed/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch (_) {
    return null;
  }

  return null;
}

function renderCaseStudyItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<article class="case-study-card"><h3>No case studies added yet</h3></article>';
  }

  const visibleItems = items.filter((item) => item.isVisible !== false);

  if (visibleItems.length === 0) {
    return '<article class="case-study-card"><h3>No case studies added yet</h3></article>';
  }

  // Group items by topic (Customer Name)
  const grouped = {};
  visibleItems.forEach((item) => {
    const key = item.topic || "Other";
    if (!grouped[key]) {
      grouped[key] = {
        topic: key,
        industry: item.industry,
        logo: item.logo,
        items: [],
      };
    }
    grouped[key].items.push(item);
  });

  const bulletIcon =
    '<svg class="case-bullet-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path d="M5 8.3 7 10.3 11.4 5.9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  const sectionDefs = [
    { key: "executiveSummary", label: "Executive Summary" },
    { key: "problemStatement", label: "Problem Statement" },
    { key: "provideSolution", label: "Implemented Solution" },
    { key: "benefits", label: "Benefits" },
    { key: "whatNext", label: "What Next" },
      { key: "technologyStack", label: "Technology Stack" },
  ];

  return Object.values(grouped)
    .map((group, groupIndex) => {
      const topic = escapeHtml(group.topic);
      const industry = escapeHtml(group.industry || "");
      const logo = group.logo || "";
      const aboutCustomer = group.items[0]?.aboutCustomer
        ? escapeHtml(group.items[0].aboutCustomer)
        : "";

      const logoHtml = logo
        ? `<img src="${escapeHtml(logo)}" alt="${topic} Logo" class="customer-logo-img">`
        : `<div class="customer-logo-placeholder">${topic.charAt(0)}</div>`;

      const indicatorsHtml =
        group.items.length > 1
          ? `<div class="carousel-indicators">
             ${group.items.map((_, i) => `<button class="c-indicator ${i === 0 ? "active" : ""}" data-index="${i}" aria-label="Go to slide ${i + 1}">${i + 1}</button>`).join("")}
           </div>`
          : "";

      const cardsHtml = group.items
        .map((item, index) => {
          const caseTitle = escapeHtml(
            String(item?.title || `${group.topic} Transformation Story`).trim(),
          );
          const imageList = Array.isArray(item?.image)
            ? item.image
            : item?.image
              ? [item.image]
              : Array.isArray(item?.images)
                ? item.images
                : [];

          const imagesHtml = imageList
            .map((src, imgIndex) => {
              const youtubeEmbed = getYouTubeEmbedUrl(src);
              const safeSrc = escapeHtml(src);
              const mediaTitle = escapeHtml(
                youtubeEmbed ? `YouTube Video ${imgIndex + 1}` : toImageTitle(src, imgIndex),
              );

              if (youtubeEmbed) {
                const safeEmbed = escapeHtml(youtubeEmbed);
                return `
                <figure class="case-image-card case-video-card">
                  <div class="case-video-frame-wrap">
                    <iframe
                      class="case-video-frame"
                      src="${safeEmbed}"
                      title="${mediaTitle}"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <figcaption class="case-image-caption">${mediaTitle}</figcaption>
                </figure>
              `;
              }

              return `
                <figure class="case-image-card">
                  <img class="case-image" src="${safeSrc}" alt="${topic} image ${imgIndex + 1}" loading="lazy" data-image-title="${mediaTitle}" />
                  <button type="button" class="case-image-expand-btn" aria-label="Expand image">⤢</button>
                  <figcaption class="case-image-caption">${mediaTitle}</figcaption>
                </figure>
              `;
            })
            .join("");

          const detailFallback = String(item?.details || "").trim();

          // Determine which sections to show based on item position
          const targetKeys =
            index === 0
              ? ["executiveSummary", "provideSolution", "technologyStack"]
              : [
                  "executiveSummary",
                  "problemStatement",
                  "provideSolution",
                  "benefits",
                  "whatNext",
                ];

          const sectionItems = targetKeys
            .map((key) => {
              const sectionDef = sectionDefs.find((d) => d.key === key);
              if (!sectionDef) return "";

              let rawValue = item?.[sectionDef.key];
              if (
                (rawValue === undefined ||
                  rawValue === null ||
                  rawValue === "") &&
                detailFallback
              ) {
                rawValue =
                  sectionDef.key === "problemStatement" ? detailFallback : "";
              }
              if (
                rawValue === undefined ||
                rawValue === null ||
                rawValue === ""
              )
                return "";
              const value = escapeHtml(rawValue).replace(/\r?\n/g, "<br />");
              return `
                <details class="case-section" open>
                  <summary class="case-section-summary">${bulletIcon}<span>${sectionDef.label}</span></summary>
                  <div class="case-section-body"><p>${value}</p></div>
                </details>
              `;
            })
            .join("");

          return `
        <div class="carousel-item">
          <article class="case-study-card">
            <div class="case-card-layout">
              <div class="case-content-col">
                <h3 class="case-story-title">${caseTitle}</h3>
                <div class="case-section-controls" role="group" aria-label="Section controls">
                  <button type="button" class="case-toggle-btn" data-action="expand-all">Expand all</button>
                  <button type="button" class="case-toggle-btn" data-action="collapse-all">Collapse all</button>
                </div>
                ${sectionItems ? `<div class="case-section-list">${sectionItems}</div>` : ""}
              </div>
              ${
                imagesHtml
                  ? `<aside class="case-media-col"><h3 class="case-media-title">Reference Images</h3><div class="case-image-grid">${imagesHtml}</div></aside>`
                  : ""
              }
            </div>
          </article>
        </div>
      `;
        })
        .join("");

      return `
        <section class="customer-section" id="customer-group-${groupIndex}">
          <div class="customer-header">
            ${logoHtml}
            <div>
              <h2 class="customer-name">${topic}</h2>
              ${industry ? `<p class="customer-industry">${industry}</p>` : ""}
              ${aboutCustomer ? `<p class="customer-about">${aboutCustomer}</p>` : ""}
            </div>
          </div>
          ${indicatorsHtml}
          <div class="carousel-track" style="display: flex; flex-wrap: nowrap; overflow-x: auto;">
            ${cardsHtml}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderFromTemplate(templateFile, outputFile, options = {}) {
  const templatePath = path.join(rootDir, templateFile);
  let html = fs.readFileSync(templatePath, "utf8");

  const entries = [];
  collectContentEntries(content, entries);

  const filteredEntries = entries.filter((entry) => {
    if (!options.scopePrefix) return true;
    return entry.selector.startsWith(options.scopePrefix);
  });

  filteredEntries.forEach((entry) => {
    html = applyEntryToHtml(html, entry);
  });

  if (options.includeCaseItems && html.includes(CASE_ITEMS_TOKEN)) {
    html = html.replace(
      CASE_ITEMS_TOKEN,
      renderCaseStudyItems(content?.caseStudy?.items),
    );
  }

  fs.writeFileSync(path.join(rootDir, outputFile), html, "utf8");
}

function generateSitemap() {
  const domain = "https://www.digitalaigarage.com";
  const now = new Date().toISOString().slice(0, 10);
  const pages = ["/", "/about.html", "/case-study.html"];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(
      (page) =>
        `  <url><loc>${domain}${page}</loc><lastmod>${now}</lastmod></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(rootDir, "sitemap.xml"), xml, "utf8");
}

function generateRobots() {
  const txt = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://www.digitalaigarage.com/sitemap.xml",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(rootDir, "robots.txt"), txt, "utf8");
}

renderFromTemplate("index.template.html", "index.html");
renderFromTemplate("about.template.html", "about.html");
renderFromTemplate("case-study.template.html", "case-study.html", {
  includeCaseItems: true,
});
generateSitemap();
generateRobots();

console.log(
  "Generated index.html, about.html, case-study.html, sitemap.xml, and robots.txt",
);
