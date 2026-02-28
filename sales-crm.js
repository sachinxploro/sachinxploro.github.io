function vote(type) {
  const el = document.getElementById("voteResult");
  if (!el) return;

  if (type === "risk") {
    el.textContent =
      "Bold choice 😬 Hope that Mercedes has good insurance...";
    el.className = "driver-service-vote-result risk-win";
    return;
  }

  el.textContent = "Smart. Skill beats chrome every time. 🏆";
  el.className = "driver-service-vote-result skill-win";
}

window.vote = vote;
