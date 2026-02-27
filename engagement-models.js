function initEngagementModelLinks() {
  const links = Array.from(document.querySelectorAll(".engagement-know-more"));
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", targetId);
    });
  });
}

document.addEventListener("DOMContentLoaded", initEngagementModelLinks);
