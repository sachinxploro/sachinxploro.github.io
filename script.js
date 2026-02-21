// ---------------------------------------------
// 1️⃣ Auto-update footer year
// ---------------------------------------------
document.getElementById("year").textContent = new Date().getFullYear();

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
