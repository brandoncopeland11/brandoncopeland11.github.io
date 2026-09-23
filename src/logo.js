import { profile } from "./data/profile.js";

export function mountSiteLogo() {
  document.querySelectorAll(".site-nav__logo").forEach((logo) => {
    logo.setAttribute("aria-label", `${profile.name}, ${profile.navTitle}, home`);
    logo.innerHTML = `<img class="site-nav__logo-photo" src="${profile.photo}" alt="" width="40" height="40" decoding="async" /><span class="site-nav__logo-text"><span class="site-nav__logo-name">${profile.name}</span><span class="site-nav__logo-title">${profile.navTitle}</span></span>`;
  });
}
