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
  const attrRegex = new RegExp(`\\s${escapeRegExp(attribute)}=("[^"]*"|'[^']*')`, "i");
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
    "i"
  );

  if (entry.attribute) {
    return html.replace(openTagPattern, (fullTag) =>
      setAttributeOnTag(fullTag, entry.attribute, entry.value)
    );
  }

  const metaPattern = new RegExp(
    `(<meta[^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*>)`,
    "i"
  );
  if (metaPattern.test(html)) {
    return html.replace(metaPattern, (fullTag) =>
      setAttributeOnTag(fullTag, "content", entry.value)
    );
  }

  const elementPattern = new RegExp(
    `(<([a-zA-Z][a-zA-Z0-9:-]*)[^>]*\\sid=["']${escapeRegExp(id)}["'][^>]*>)([\\s\\S]*?)(</\\2>)`,
    "i"
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

function renderCaseStudyItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<article class="case-study-card"><h3>No case studies added yet</h3></article>';
  }

  return items
    .map((item, index) => {
      const topic = escapeHtml(item?.topic || `Case Study ${index + 1}`);
      const details = escapeHtml(item?.details || "").replace(/\r?\n/g, "<br />");
      const imageList = Array.isArray(item?.image)
        ? item.image
        : item?.image
          ? [item.image]
          : Array.isArray(item?.images)
            ? item.images
            : [];

      const imagesHtml = imageList
        .map((src, imgIndex) => {
          const safeSrc = escapeHtml(src);
          return `<img class="case-image" src="${safeSrc}" alt="${topic} image ${imgIndex + 1}" loading="lazy" />`;
        })
        .join("");

      return `
        <article class="case-study-card">
          <h3>${topic}</h3>
          <p>${details}</p>
          ${imagesHtml ? `<div class="case-image-grid">${imagesHtml}</div>` : ""}
        </article>
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
    html = html.replace(CASE_ITEMS_TOKEN, renderCaseStudyItems(content?.caseStudy?.items));
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
        `  <url><loc>${domain}${page}</loc><lastmod>${now}</lastmod></url>`
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

console.log("Generated index.html, about.html, case-study.html, sitemap.xml, and robots.txt");
