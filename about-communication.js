async function loadAboutCommunication() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) return;

    const content = await response.json();
    const communication = content?.aboutPage?.customerCommunication;
    if (!communication || !Array.isArray(communication.sections)) return;

    const cardsContainer = document.getElementById("about-communication-cards");
    const dotsContainer = document.getElementById("about-communication-dots");
    if (!cardsContainer) return;

    cardsContainer.innerHTML = "";
    if (dotsContainer) dotsContainer.innerHTML = "";

    const customerImage =
      communication.customerImage || "assets/images/customer-avatar.png";
    const dagStaffImage =
      communication.dagStaffImage || "assets/images/dag-staff-avatar.png";

    const track = document.createElement("div");
    track.className = "communication-track";
    cardsContainer.appendChild(track);

    const dots = [];
    let activeIndex = 0;
    let autoTimer = null;
    const autoIntervalMs = 4500;

    function setActive(index) {
      activeIndex = Math.max(0, Math.min(index, communication.sections.length - 1));
      track.style.transform = "translateX(-" + activeIndex * 100 + "%)";
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
      });
    }

    function resetAutoPlay() {
      if (autoTimer) {
        clearInterval(autoTimer);
      }
      if (communication.sections.length <= 1) return;
      autoTimer = setInterval(function () {
        const next = (activeIndex + 1) % communication.sections.length;
        setActive(next);
      }, autoIntervalMs);
    }

    communication.sections.forEach(function (section, index) {
      if (!section) return;

      const slide = document.createElement("div");
      slide.className = "communication-slide";

      const card = document.createElement("article");
      card.className = "communication-card";

      const top = document.createElement("div");
      top.className = "communication-top";
      const question = document.createElement("p");
      question.className = "communication-question";
      question.textContent = String(section.question || "");
      const customerImg = document.createElement("img");
      customerImg.className = "comm-avatar";
      customerImg.src = customerImage;
      customerImg.alt = "Customer";
      top.appendChild(question);
      top.appendChild(customerImg);

      const bottom = document.createElement("div");
      bottom.className = "communication-bottom";
      const dagImg = document.createElement("img");
      dagImg.className = "comm-avatar";
      dagImg.src = dagStaffImage;
      dagImg.alt = "DAG Staff";
      const answer = document.createElement("p");
      answer.className = "communication-answer";
      answer.textContent = String(section.answer || "");
      bottom.appendChild(dagImg);
      bottom.appendChild(answer);

      card.appendChild(top);
      card.appendChild(bottom);

      slide.appendChild(card);
      track.appendChild(slide);

      if (dotsContainer) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "communication-dot";
        dot.setAttribute("aria-label", "Show communication " + (index + 1));
        dot.textContent = String(index + 1);
        dot.addEventListener("click", function () {
          setActive(index);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    });

    if (communication.sections.length <= 1 && dotsContainer) {
      dotsContainer.style.display = "none";
    } else if (dotsContainer) {
      dotsContainer.style.display = "flex";
    }

    if (communication.sections.length > 0) {
      setActive(0);
      resetAutoPlay();
    }

    // Pause rotation while hovering over the card area for easier reading.
    cardsContainer.addEventListener("mouseenter", function () {
      if (autoTimer) clearInterval(autoTimer);
    });
    cardsContainer.addEventListener("mouseleave", function () {
      resetAutoPlay();
    });

    window.addEventListener("beforeunload", function () {
      if (autoTimer) clearInterval(autoTimer);
    });
  } catch (error) {
    console.error("About communication loading error:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAboutCommunication);
} else {
  loadAboutCommunication();
}
