function vote(type) {
  const el = document.getElementById("voteResult");
  if (!el) return;

  if (type === "risk") {
    el.textContent =
      "Bold choice 😬 Hope that Mercedes has good insurance...";
    el.className = "vote-result risk-win";
    return;
  }

  el.textContent = "Smart. Skill beats chrome every time. 🏆";
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
    doc.querySelectorAll("script").forEach(function (script) {
      script.remove();
    });

    root.innerHTML = doc.body ? doc.body.innerHTML : html;
  } catch (_) {
    root.innerHTML =
      '<div class="driver-service-fallback"><p>Driver service content could not be loaded.</p></div>';
  }
}

window.vote = vote;

document.addEventListener("DOMContentLoaded", loadDriverServiceMarkup);
