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
// ---------------------------------------------
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

  // 5️⃣ Starts ---------------------------------------------
// Contact form Power Automate Handler
// Validates fields and sends data to a Webhook URL
// ---------------------------------------------

document.getElementById("contactForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Stops the page from refreshing

  // 1. Collect the data from the HTML inputs
  const formData = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim()
  };

  // 2. Mandatory Field Check
  // If any field is empty, show an alert and stop the code
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
    alert("Please fill in all mandatory fields.");
    return;
  }

  // 3. Power Automate Webhook URL
  // REPLACE THE LINK BELOW with your "HTTP Request" URL from Power Automate
  const webhookUrl = "https://66c162cb79beef99b01b582dbf191f.d9.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c215fcc34aee4b009b14ab77494bee21/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bo2btIrWRYnmDbRWYg_9ZGqoNwVOcbuej2LPzgwsBjA";

  // 4. Trigger the API call (The Webhook)
  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData), // Converts the JS object into a JSON string
  })
    .then((response) => {
      if (response.ok) {
        alert("Success! Your message has been sent via Power Automate.");
        document.getElementById("contactForm").reset(); // Clears the form
      } else {
        alert("Oops! Something went wrong on the server.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to connect to the server.");
    });
});

// 4️⃣ Ends -----------------------------------------------
