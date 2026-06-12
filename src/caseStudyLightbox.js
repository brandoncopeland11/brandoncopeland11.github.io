const LIGHTBOX_SELECTOR =
  ".case-study-content .case-study-visual img, .case-study-content img.case-study-image";

const isZoomableImage = (img) => {
  if (!(img instanceof HTMLImageElement)) return false;
  if (img.closest(".case-study-company")) return false;
  if (!img.src || img.src.startsWith("data:")) return false;
  return true;
};

const getImageSrc = (img) => img.currentSrc || img.src;

const getImageCaption = (img) => {
  const figure = img.closest("figure");
  const caption = figure?.querySelector("figcaption");
  return caption?.textContent.trim() || img.alt.trim() || "";
};

export const initCaseStudyLightbox = () => {
  const images = Array.from(document.querySelectorAll(LIGHTBOX_SELECTOR)).filter(
    isZoomableImage
  );

  if (!images.length) return;

  let lastFocusedEl = null;

  const lightboxEl = document.createElement("div");
  lightboxEl.className = "case-study-lightbox";
  lightboxEl.hidden = true;
  lightboxEl.innerHTML = `
    <div class="case-study-lightbox__backdrop" data-lightbox-close tabindex="-1"></div>
    <div
      class="case-study-lightbox__dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image"
    >
      <button type="button" class="case-study-lightbox__close" data-lightbox-close aria-label="Close">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
      <figure class="case-study-lightbox__figure">
        <img class="case-study-lightbox__image" alt="" decoding="async" />
        <figcaption class="case-study-lightbox__caption"></figcaption>
      </figure>
    </div>
  `;
  document.body.appendChild(lightboxEl);

  const imageEl = lightboxEl.querySelector(".case-study-lightbox__image");
  const captionEl = lightboxEl.querySelector(".case-study-lightbox__caption");
  const closeBtn = lightboxEl.querySelector(".case-study-lightbox__close");

  const openImage = (img) => {
    const caption = getImageCaption(img);

    imageEl.src = getImageSrc(img);
    imageEl.alt = img.alt;
    captionEl.textContent = caption;
    captionEl.hidden = !caption;
    lastFocusedEl = document.activeElement;
    lightboxEl.hidden = false;
    document.body.classList.add("is-case-study-lightbox-open");
    closeBtn.focus();
  };

  const close = () => {
    lightboxEl.hidden = true;
    document.body.classList.remove("is-case-study-lightbox-open");
    imageEl.removeAttribute("src");
    if (lastFocusedEl instanceof HTMLElement) {
      lastFocusedEl.focus();
    }
  };

  images.forEach((img, index) => {
    img.classList.add("case-study-image--zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute(
      "aria-label",
      img.alt.trim()
        ? `View larger: ${img.alt.trim()}`
        : `View image ${index + 1} larger`
    );

    const handleOpen = (event) => {
      event.preventDefault();
      openImage(img);
    };

    img.addEventListener("click", handleOpen);
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        handleOpen(event);
      }
    });
  });

  lightboxEl.addEventListener("click", (event) => {
    if (event.target.closest("[data-lightbox-close]")) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightboxEl.hidden || event.key !== "Escape") return;
    event.preventDefault();
    close();
  });
};
