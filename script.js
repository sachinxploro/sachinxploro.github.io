// ---------------------------------------------
// 1️⃣ Auto-update footer year
// ---------------------------------------------
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ---------------------------------------------
// 1.1️⃣ Theme toggle (dark/light)
// ---------------------------------------------
function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    const isLight = mode === "light";
    themeBtn.textContent = isLight ? "Dark Mode" : "Light Mode";
    themeBtn.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode",
    );
  }
}

function initThemeToggle() {
  const navList = document.querySelector(".nav-list");
  if (!navList) return;

  let themeBtn = document.getElementById("themeToggleBtn");
  if (!themeBtn) {
    const item = document.createElement("li");
    item.className = "theme-toggle-item";

    themeBtn = document.createElement("button");
    themeBtn.id = "themeToggleBtn";
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle-btn";

    item.appendChild(themeBtn);
    navList.appendChild(item);
  }

  const savedTheme = localStorage.getItem("dag-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)")
    .matches
    ? "light"
    : "dark";
  applyTheme(savedTheme || preferredTheme);

  themeBtn.addEventListener("click", function () {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("dag-theme", nextTheme);
  });
}

// ---------------------------------------------
// 1.2️⃣ Mobile nav toggle
// ---------------------------------------------
function initMobileNavToggle() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const navWrap = header.querySelector(".nav-wrap");
  const nav = header.querySelector("nav");
  if (!navWrap || !nav) return;

  let toggleBtn = document.getElementById("mobileMenuToggleBtn");
  if (!toggleBtn) {
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.id = "mobileMenuToggleBtn";
    toggleBtn.className = "mobile-menu-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle navigation menu");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = `
      <span class="mobile-menu-toggle-lines" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    `;
    navWrap.insertBefore(toggleBtn, nav);
  }

  const mobileMedia = window.matchMedia("(max-width: 820px)");

  function closeMenu() {
    header.classList.remove("nav-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = header.classList.toggle("nav-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggleBtn.addEventListener("click", toggleMenu);

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (mobileMedia.matches) closeMenu();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  mobileMedia.addEventListener("change", function (event) {
    if (!event.matches) closeMenu();
  });
}

// ---------------------------------------------
// 1.3️⃣ AI Buzz timed popup
// Shows after 10s and then every 120s
// ---------------------------------------------
function initAiBuzzPopup() {
  const currentPath = (window.location.pathname || "").toLowerCase();
  if (currentPath.endsWith("/ai-buzz-page.html") || currentPath.endsWith("ai-buzz-page.html")) {
    return;
  }

  const popup = document.createElement("div");
  popup.className = "ai-buzz-popup";
  popup.setAttribute("aria-hidden", "true");
  popup.innerHTML = `
    <div class="ai-buzz-popup-backdrop" data-action="close"></div>
    <div class="ai-buzz-popup-panel" role="dialog" aria-modal="true" aria-label="AI Buzz update">
      <h3 class="ai-buzz-popup-title">Busting the AI Buzz</h3>
      <p class="ai-buzz-popup-text">Everyone's racing to "do AI."<br>But AI without a foundation is a house of cards.<br>The real journey to meaningful AI starts long before the first model is trained.</p>
      <div class="ai-buzz-popup-actions">
        <button type="button" class="ai-buzz-popup-btn ai-buzz-popup-cancel" data-action="cancel">Cancel</button>
        <a class="ai-buzz-popup-btn ai-buzz-popup-open" href="ai-buzz-page.html">Open</a>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  let popupVisible = false;
  let popupTimerId = null;

  function scheduleOpen(delayMs) {
    if (popupTimerId) {
      window.clearTimeout(popupTimerId);
    }
    popupTimerId = window.setTimeout(openPopup, delayMs);
  }

  function openPopup() {
    if (popupVisible) return;
    popupVisible = true;
    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");
  }

  function closePopup() {
    popupVisible = false;
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    // After cancel/close, wait a full cooldown before showing again.
    scheduleOpen(120000);
  }

  popup.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    if (action === "close" || action === "cancel") {
      closePopup();
    }
  });

  scheduleOpen(10000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThemeToggle);
  document.addEventListener("DOMContentLoaded", initMobileNavToggle);
  document.addEventListener("DOMContentLoaded", initAiBuzzPopup);
} else {
  initThemeToggle();
  initMobileNavToggle();
  initAiBuzzPopup();
}

// ---------------------------------------------
// 2️⃣ Scroll reveal animation
// Adds "in-view" class when element enters viewport
// ---------------------------------------------
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target); // Stop observing once animated
      }
    });
  },
  { threshold: 0.18 }, // Trigger when 18% visible
);

// Observe all elements with class "reveal"
document.querySelectorAll(".reveal").forEach(function (el) {
  observer.observe(el);
});

// ---------------------------------------------
// 3️⃣ Animated statistics counter
// Animates numbers when visible in viewport
// Waits for content.json to populate data-target values.
// ---------------------------------------------
let statsInitialized = false;

function initStatsCounter() {
  if (statsInitialized) return;
  statsInitialized = true;

  const statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.getAttribute("data-target"));
        const duration = 1400; // animation duration in ms
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = String(Math.floor(progress * target));

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = String(target); // Ensure exact final value
          }
        }

        requestAnimationFrame(tick);
        statObserver.unobserve(el); // Stop observing after animation
      });
    },
    { threshold: 0.55 }, // Trigger when 55% visible
  );

  // Observe elements with class "stat-num"
  document.querySelectorAll(".stat-num").forEach(function (el) {
    statObserver.observe(el);
  });
}

document.addEventListener("contentLoaded", initStatsCounter);
// Fallback in case content event is missed.
window.setTimeout(initStatsCounter, 700);

// ---------------------------------------------
// 4️⃣ Customer Carousel Logic
// Handles auto-scroll and numbered indicators
// ---------------------------------------------
function initCarousels() {
  const carousels = document.querySelectorAll(".customer-section");

  carousels.forEach((section) => {
    const track = section.querySelector(".carousel-track");
    const indicators = section.querySelectorAll(".c-indicator");

    if (!track || indicators.length === 0) return;

    let currentIndex = 0;
    const count = indicators.length;
    let timer;
    const intervalTime = 6000; // 6 seconds per slide

    const updateIndicators = (index) => {
      indicators.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    };

    const scrollToSlide = (index) => {
      // Scroll to the specific slide
      const slideWidth = track.clientWidth;
      track.scrollTo({
        left: index * slideWidth,
        behavior: "smooth",
      });
      currentIndex = index;
      updateIndicators(index);
    };

    const startAuto = () => {
      stopAuto();
      timer = setInterval(() => {
        const next = (currentIndex + 1) % count;
        scrollToSlide(next);
      }, intervalTime);
    };

    const stopAuto = () => clearInterval(timer);

    // Event listeners for indicators
    indicators.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stopAuto();
        scrollToSlide(i);
        startAuto();
      });
    });

    // Pause on hover
    track.addEventListener("mouseenter", stopAuto);
    track.addEventListener("mouseleave", startAuto);

    // Handle manual scroll (update dots)
    track.addEventListener(
      "scroll",
      () => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        if (index !== currentIndex && index < count) {
          currentIndex = index;
          updateIndicators(index);
        }
      },
      { passive: true },
    );

    // Start the carousel
    startAuto();
  });
}

document.addEventListener("DOMContentLoaded", initCarousels);

function getHeroVideoSourceForToday() {
  const dayOfMonth = new Date().getDate();
  const firstHalfUrl =
    "https://digitalaigaragewebsite.blob.core.windows.net/website/DAG.Hero.optimized.mp4?sp=r&st=2026-02-27T03:17:26Z&se=2030-02-27T11:32:26Z&spr=https&sv=2024-11-04&sr=b&sig=gAiUVnrOVDVIlOxXWWxqkK2YqEl%2BZnG3Efj11KuiEcY%3D";
  const secondHalfUrl =
    "https://digitalaigaragewebsite1.blob.core.windows.net/website/DAG.Hero.optimized.mp4?sp=r&st=2026-02-27T03:20:38Z&se=2030-02-27T11:35:38Z&spr=https&sv=2024-11-04&sr=b&sig=eYNzfg60n6JAEG4lm8W%2B1nRSKeZZkiTQLEk%2ByGqAyX8%3D";

  return dayOfMonth <= 15 ? firstHalfUrl : secondHalfUrl;
}

function initHeroVideoSource() {
  const heroVideo = document.querySelector(".landing-hero-media");
  if (!heroVideo) return;

  const selectedSrc = getHeroVideoSourceForToday();
  if (heroVideo.getAttribute("src") !== selectedSrc) {
    heroVideo.setAttribute("src", selectedSrc);
    heroVideo.load();
  }
}

function initHeroAudioToggle() {
  const heroVideo = document.querySelector(".landing-hero-media");
  const audioToggleBtn = document.getElementById("hero-audio-toggle");

  if (!heroVideo || !audioToggleBtn) return;

  initHeroVideoSource();

  function syncAudioButton() {
    const isMuted = heroVideo.muted;
    audioToggleBtn.textContent = isMuted ? "Unmute" : "Mute";
    audioToggleBtn.setAttribute("aria-pressed", String(!isMuted));
    audioToggleBtn.setAttribute(
      "aria-label",
      isMuted ? "Unmute hero video" : "Mute hero video",
    );
  }

  audioToggleBtn.addEventListener("click", function () {
    heroVideo.muted = !heroVideo.muted;
    heroVideo.play().catch(function () {
      // If user gesture playback is blocked, button state still reflects mute status.
    });
    syncAudioButton();
  });

  // Start unmuted by default; fall back to muted autoplay if browser policy blocks it.
  heroVideo.muted = false;
  heroVideo.play().catch(function () {
    heroVideo.muted = true;
    heroVideo.play().catch(function () {
      // Ignore if autoplay is blocked completely.
    });
    syncAudioButton();
  });

  syncAudioButton();
}

document.addEventListener("DOMContentLoaded", initHeroAudioToggle);

/* ---------------------------------------------
// 5️⃣ Contact form email handler
// Prevents default form submit
// Opens mail client with pre-filled email
// ---------------------------------------------
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    const subject = encodeURIComponent("Website Contact Form Message");

    const body = encodeURIComponent(
      "First Name: " + firstName + "\n" +
      "Last Name: " + lastName + "\n" +
      "Email: " + email + "\n\n" +
      "Message:\n" + message
    );

    // Opens user's default email app
    window.location.href =
      "mailto:sachinxploro@gmail.com?subject=" +
      subject +
      "&body=" +
      body;
  });
*/
