function getFallbackVideos() {
  return [
    {
      sequence: 1,
      type: "youtube",
      link: "oVMiLzE-K1I",
      title: "About Us",
    },
    {
      sequence: 2,
      type: "youtube",
      link: "8MuTZAbvPAE",
      title: "Connect Python with Power Apps",
    },
  ];
}

async function loadVideosFromContentJson() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) return getFallbackVideos();

    const content = await response.json();
    const items = content?.videos?.caseStudy?.items;
    return Array.isArray(items) && items.length ? items : getFallbackVideos();
  } catch (_) {
    return getFallbackVideos();
  }
}

function ensureVideoModal() {
  const existing = document.getElementById("videoModal");
  if (existing) return existing;

  const modalHTML = `
  <div id="videoModal" class="video-modal">
    <div class="video-modal-content">
      <button class="close-video" id="closeVideoBtn">&times;</button>
      <div id="modalVideoContainer" style="width:100%; height:100%"></div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  return document.getElementById("videoModal");
}

function renderVideoCards(videoList) {
  const videoContainer = document.querySelector(".video-grid");
  if (!videoContainer) return;

  const modal = ensureVideoModal();
  const modalContainer = document.getElementById("modalVideoContainer");
  const closeBtn = document.getElementById("closeVideoBtn");

  const sortedVideos = videoList
    .slice()
    .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0));

  sortedVideos.forEach((video) => {
    const videoCard = document.createElement("div");
    videoCard.className = "video-card reveal in-view";

    videoCard.onclick = () => {
      const embedUrl =
        video.type === "youtube"
          ? `https://www.youtube.com/embed/${video.link}?autoplay=1`
          : video.link;

      modalContainer.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      modal.classList.add("active");
    };

    if (video.type === "youtube") {
      const thumbUrl = `https://img.youtube.com/vi/${video.link}/hqdefault.jpg`;
      videoCard.innerHTML = `
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000;">
          <img src="${thumbUrl}" alt="${video.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
          <div class="play-button"></div>
        </div>
        <div style="padding: 1rem; text-align: center; font-weight: 600;">${video.title}</div>
      `;
    } else {
      videoCard.innerHTML = `
        <div style="position: relative; width: 100%; height: 315px;">
          <iframe width="100%" height="100%" src="${video.link}" frameborder="0" style="pointer-events: none;"></iframe>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;"></div>
        </div>
        <div style="padding: 1rem; text-align: center; font-weight: 600;">${video.title}</div>
      `;
    }

    videoContainer.appendChild(videoCard);
  });

  function closeModal() {
    modal.classList.remove("active");
    modalContainer.innerHTML = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const videos = await loadVideosFromContentJson();
  renderVideoCards(videos);
});
