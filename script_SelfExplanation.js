/* 1️⃣ Starts ---------------------------------------------
 Auto-update footer year
So when you write:

document.getElementById("year").textContent = new Date().getFullYear();

You’re basically saying:
“Hey browser, go into the HTML page and find the element with id='year'.” and
.textContent is a property that represents the text content of the element. 
By setting it to new Date().getFullYear(), we’re updating the text inside that 
element to be the current year (like 2024). 
This way, every time someone visits the page, 
it will show the correct year without us having to change it manually in the HTML.

---------------------------------------------*/

document.getElementById("year").textContent = new Date().getFullYear();

// 1️⃣ Ends ---------------------------------------------

/* 2️⃣ Starts ---------------------------------------------
Scroll reveal animation
Adds the "in-view" class to elements as they enter the screen.

 EXPLANATION:
  - IntersectionObserver: A built-in browser tool that "watches" elements.
  - entry.isIntersecting: Checks if the element is actually visible on the screen.
  - threshold: 0.18: Means the animation triggers when 18% of the element is visible.
  - unobserve: Once the animation runs once, we stop watching it to save memory.
*/

const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target); 
      }
    });
  },
  { threshold: 0.18 } 
);

// We tell the observer to watch every HTML element that has the class "reveal"
document.querySelectorAll(".reveal").forEach(function (el) {
  observer.observe(el);
});

// 2️⃣ Ends -----------------------------------------------

