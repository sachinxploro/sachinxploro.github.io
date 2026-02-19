async function loadAboutCommunication() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) return;

    const content = await response.json();
    const communication = content?.aboutPage?.customerCommunication;
    if (!communication || !Array.isArray(communication.sections)) return;

    const cardsContainer = document.getElementById("about-communication-cards");
    if (!cardsContainer) return;

    cardsContainer.innerHTML = "";

    const customerImage =
      communication.customerImage || "assets/images/customer-avatar.svg";
    const dagStaffImage =
      communication.dagStaffImage || "assets/images/dag-staff-avatar.svg";

    communication.sections.forEach(function (section) {
      if (!section) return;

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
      cardsContainer.appendChild(card);
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
