import { profile } from "./data/profile.js";

const TITLE_ROTATE_MS = 4000;
const TITLE_TRANSITION_MS = 500;

const rotateTitles = (titleEl) => {
  const items = [...titleEl.querySelectorAll(".site-nav__logo-title-item")];
  if (items.length < 2) return;

  let activeIndex = 0;
  window.setInterval(() => {
    const current = items[activeIndex];
    activeIndex = (activeIndex + 1) % items.length;
    const next = items[activeIndex];

    current.classList.remove("is-active");
    current.classList.add("is-exiting");
    next.classList.add("is-active");

    window.setTimeout(() => current.classList.remove("is-exiting"), TITLE_TRANSITION_MS);
  }, TITLE_ROTATE_MS);
};

export function mountSiteLogo() {
  const titles = [profile.navTitle, profile.status];

  document.querySelectorAll(".site-nav__logo").forEach((logo) => {
    logo.setAttribute("aria-label", `${profile.name}, ${profile.navTitle}, ${profile.status}, home`);
    const titleItems = titles
      .map(
        (title, index) =>
          `<span class="site-nav__logo-title-item${index === 0 ? " is-active" : ""}">${title}</span>`
      )
      .join("");
    logo.innerHTML = `<img class="site-nav__logo-photo" src="${profile.photo}" alt="" width="40" height="40" decoding="async" /><span class="site-nav__logo-text"><span class="site-nav__logo-name">${profile.name}</span><span class="site-nav__logo-title">${titleItems}</span></span>`;
    rotateTitles(logo.querySelector(".site-nav__logo-title"));
  });
}
