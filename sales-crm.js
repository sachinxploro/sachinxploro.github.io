function getSalesCrmFallbackImages() {
  return [
    "assets/images/tool-placeholder.png",
    "assets/images/PowerApps_scalable.svg",
    "assets/images/PowerAutomate_scalable.svg",
    "assets/images/Dataverse_scalable.svg",
    "assets/images/AzureCloud.webp",
  ];
}

async function loadSalesCrmHeroConfig() {
  try {
    const response = await fetch("content.json", { cache: "no-store" });
    if (!response.ok) {
      return { images: getSalesCrmFallbackImages() };
    }

    const content = await response.json();
    const images = content?.salesCrm?.hero?.images;
    if (Array.isArray(images) && images.length > 0) {
      return { images: images };
    }
  } catch (_) {
    // Ignore fetch errors and use fallback images.
  }

  return { images: getSalesCrmFallbackImages() };
}

function initSalesCrmHeroSlider(images) {
  const track = document.getElementById("sales-crm-hero-track");
  if (!track) return;

  const validImages = Array.isArray(images) && images.length ? images : getSalesCrmFallbackImages();

  track.innerHTML = "";
  validImages.forEach(function (src, index) {
    const slide = document.createElement("div");
    slide.className = "sales-crm-hero-slide";
    if (index === 0) {
      slide.classList.add("is-active");
    }

    const image = document.createElement("img");
    image.src = src;
    image.alt = "Sales CRM hero visual";
    image.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(image);
    track.appendChild(slide);
  });

  const slides = Array.from(track.querySelectorAll(".sales-crm-hero-slide"));
  if (slides.length <= 1) return;

  let activeIndex = 0;
  window.setInterval(function () {
    slides[activeIndex].classList.remove("is-active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("is-active");
  }, 3800);
}

document.addEventListener("DOMContentLoaded", async function () {
  const heroConfig = await loadSalesCrmHeroConfig();
  initSalesCrmHeroSlider(heroConfig.images);
});
