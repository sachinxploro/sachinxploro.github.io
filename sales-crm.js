function vote(type) {
  const el = document.getElementById("voteResult");
  if (!el) return;

  if (type === "risk") {
    el.textContent =
      "Bold choice 😬 Hope that Mercedes has good insurance...";
    el.className = "vote-result risk-win";
    return;
  }

  el.innerHTML =
    'Smart. Skill beats chrome every time. 🏆 <a href="#sales-crm-more">Continue to explore more.</a>';
  el.className = "vote-result skill-win";
}

async function loadDriverServiceMarkup() {
  const root = document.getElementById("driverServiceRoot");
  if (!root) return;

  try {
    const response = await fetch("assets/html/driver-service.html", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to load driver-service.html");
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const sourceScripts = Array.from(doc.querySelectorAll("script")).map(
      function (script) {
        return script.textContent || "";
      },
    );
    doc.querySelectorAll("script").forEach(function (script) {
      script.remove();
    });

    // Bring in the source styles so original animations are preserved.
    doc.querySelectorAll("head style, head link[rel='stylesheet']").forEach(
      function (node, index) {
        const marker = `driver-service-style-${index}`;
        if (document.head.querySelector(`[data-driver-service='${marker}']`)) {
          return;
        }

        const cloned = node.cloneNode(true);
        cloned.setAttribute("data-driver-service", marker);
        document.head.appendChild(cloned);
      },
    );

    root.innerHTML = doc.body ? doc.body.innerHTML : html;

    // Execute source scripts (canvas animation + interactions) after markup is mounted.
    sourceScripts.forEach(function (scriptText, index) {
      if (!scriptText.trim()) return;
      const script = document.createElement("script");
      script.setAttribute("data-driver-service-script", String(index));
      script.textContent = scriptText;
      root.appendChild(script);
    });

    // Keep our vote handler as the active one.
    window.vote = vote;

    try {
      const contentResponse = await fetch("content.json", { cache: "no-store" });
      if (contentResponse.ok) {
        const content = await contentResponse.json();
        const entries = content?.salesCrmDriverService?.entries;
        if (Array.isArray(entries)) {
          entries.forEach(function (entry) {
            if (!entry || typeof entry.selector !== "string") return;
            const el = root.querySelector(entry.selector);
            if (!el) return;

            if (typeof entry.attribute === "string") {
              el.setAttribute(entry.attribute, String(entry.value ?? ""));
              return;
            }

            el.innerHTML = String(entry.value ?? "");
          });
        }
      }
    } catch (_) {
      // If JSON mapping fails, keep source HTML defaults.
    }
  } catch (_) {
    root.innerHTML =
      '<div class="driver-service-fallback"><p>Driver service content could not be loaded.</p></div>';
  }
}

window.vote = vote;

document.addEventListener("DOMContentLoaded", loadDriverServiceMarkup);
