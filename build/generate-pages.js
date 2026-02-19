const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const contentPath = path.join(rootDir, "content.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

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

function renderFromTemplate(templateFile, outputFile, scopePrefix) {
  const templatePath = path.join(rootDir, templateFile);
  let html = fs.readFileSync(templatePath, "utf8");

  const entries = [];
  collectContentEntries(content, entries);

  const filteredEntries = entries.filter((entry) => {
    if (!scopePrefix) return true;
    return entry.selector.startsWith(scopePrefix);
  });

  filteredEntries.forEach((entry) => {
    html = applyEntryToHtml(html, entry);
  });

  fs.writeFileSync(path.join(rootDir, outputFile), html, "utf8");
}

function generateSitemap() {
  const domain = "https://www.digitalaigarage.com";
  const now = new Date().toISOString().slice(0, 10);
  const pages = ["/", "/about.html"];

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
generateSitemap();
generateRobots();

console.log("Generated index.html, about.html, sitemap.xml, and robots.txt");
