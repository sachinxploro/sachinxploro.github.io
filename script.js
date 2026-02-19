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
  { threshold: 0.18 } // Trigger when 18% visible
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
    { threshold: 0.55 } // Trigger when 55% visible
  );

  // Observe elements with class "stat-num"
  document.querySelectorAll(".stat-num").forEach(function (el) {
    statObserver.observe(el);
  });
}

document.addEventListener("contentLoaded", initStatsCounter);
// Fallback in case content event is missed.
window.setTimeout(initStatsCounter, 700);


/* ---------------------------------------------
// 4️⃣ Contact form email handler
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
