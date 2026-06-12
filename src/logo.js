import { profile } from "./data/profile.js";

export function mountSiteLogo() {
  document.querySelectorAll(".site-nav__logo").forEach((logo) => {
    logo.setAttribute("aria-label", `${profile.name} — home`);
    logo.innerHTML = `<img class="site-nav__logo-photo" src="${profile.photo}" alt="" width="40" height="40" decoding="async" /><span class="site-nav__logo-name">${profile.name}</span>`;
  });
}
