import { projects } from "./data/projects.js";
import { experience } from "./data/experience.js";
import { mountSiteLogo } from "./logo.js";
import { initCaseStudyLightbox } from "./caseStudyLightbox.js";

mountSiteLogo();

const masonryEl = document.getElementById("work-masonry");
const yearEl = document.getElementById("year");
const themeToggleBtns = Array.from(document.querySelectorAll("[data-theme-toggle]"));
const themeMql = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
const rootEl = document.documentElement;

const PAGE_REVEAL_MS = 80;
const PAGE_LEAVE_MS = 450;

const revealPage = () => {
  rootEl.classList.remove("is-loading", "is-leaving");
  rootEl.classList.add("is-ready");
};

const scheduleReveal = () => {
  if (reducedMotionMql.matches) {
    revealPage();
    return;
  }

  const run = () => window.setTimeout(revealPage, PAGE_REVEAL_MS);

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }
};

scheduleReveal();

const HERO_INTRO_REVEAL_DELAY_MS = 140;

const isHomePage = () => /^\/(?:index\.html)?$/.test(window.location.pathname);

const initHeroTitleIntro = () => {
  const overlapCopyEl = document.querySelector(".hero-copy--overlap");
  const waveEl = document.querySelector(".hero-emoji--wave");

  if (!isHomePage() || !overlapCopyEl || rootEl.dataset.heroLayout !== "overlap") {
    return;
  }

  if (!rootEl.classList.contains("is-hero-intro-pending")) {
    return;
  }

  let introTimeoutId = null;
  let introFallbackId = null;

  const clearIntroTimers = () => {
    if (introTimeoutId !== null) {
      window.clearTimeout(introTimeoutId);
      introTimeoutId = null;
    }
    if (introFallbackId !== null) {
      window.clearTimeout(introFallbackId);
      introFallbackId = null;
    }
  };

  const playWave = () => {
    if (!waveEl || reducedMotionMql.matches) return;

    waveEl.classList.remove("is-waving");
    void waveEl.offsetWidth;
    waveEl.classList.add("is-waving");
  };

  const finishIntro = () => {
    if (rootEl.dataset.heroIntroComplete === "true") return;

    clearIntroTimers();
    rootEl.dataset.heroIntroComplete = "true";
    rootEl.classList.remove("is-hero-intro-pending", "is-hero-intro-revealed");
    playWave();
  };

  const revealHeroTitle = () => {
    if (reducedMotionMql.matches) {
      finishIntro();
      return;
    }

    rootEl.classList.add("is-hero-intro-revealed");

    const onIntroEnd = (event) => {
      if (event.target !== overlapCopyEl || event.propertyName !== "opacity") return;

      overlapCopyEl.removeEventListener("transitionend", onIntroEnd);
      finishIntro();
    };

    overlapCopyEl.addEventListener("transitionend", onIntroEnd);
    introFallbackId = window.setTimeout(() => {
      if (rootEl.dataset.heroIntroComplete !== "true") {
        finishIntro();
      }
    }, 1100);
  };

  const runIntro = () => {
    clearIntroTimers();
    delete rootEl.dataset.heroIntroComplete;
    rootEl.classList.remove("is-hero-intro-revealed");
    rootEl.classList.add("is-hero-intro-pending");
    waveEl?.classList.remove("is-waving");

    void overlapCopyEl.offsetWidth;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        introTimeoutId = window.setTimeout(revealHeroTitle, HERO_INTRO_REVEAL_DELAY_MS);
      });
    });
  };

  const startIntro = () => runIntro();

  if (rootEl.classList.contains("is-ready")) {
    startIntro();
  } else {
    const readyObserver = new MutationObserver(() => {
      if (!rootEl.classList.contains("is-ready")) return;

      readyObserver.disconnect();
      startIntro();
    });

    readyObserver.observe(rootEl, { attributes: true, attributeFilter: ["class"] });
  }
};

initHeroTitleIntro();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    revealPage();
  }
});

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link || link.target || link.hasAttribute("download")) return;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  if (url.href === window.location.href) return;

  if (reducedMotionMql.matches) return;

  event.preventDefault();
  rootEl.classList.add("is-leaving");
  window.setTimeout(() => {
    window.location.href = url.href;
  }, PAGE_LEAVE_MS);
});

const getStoredTheme = () => {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Theme still changes for this visit if storage is unavailable.
  }
};

const setTheme = (theme, persist = false) => {
  document.documentElement.dataset.theme = theme;

  themeToggleBtns.forEach((button) => {
    button.dataset.activeTheme = theme;
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  });

  if (persist) storeTheme(theme);
};

const initialTheme = getStoredTheme() || (themeMql.matches ? "dark" : "light");
setTheme(initialTheme);

themeToggleBtns.forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  });
});

const syncThemeToSystem = () => {
  if (!getStoredTheme()) setTheme(themeMql.matches ? "dark" : "light");
};

if (themeMql.addEventListener) {
  themeMql.addEventListener("change", syncThemeToSystem);
} else {
  themeMql.addListener(syncThemeToSystem);
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const setNavScrollState = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 12);
};

setNavScrollState();
window.addEventListener("scroll", setNavScrollState, { passive: true });

if (document.body.classList.contains("case-study-page")) {
  const progressEl = document.createElement("div");
  progressEl.className = "case-study-scroll-progress";
  progressEl.setAttribute("aria-hidden", "true");
  progressEl.innerHTML = '<span class="case-study-scroll-progress__bar"></span>';
  document.body.prepend(progressEl);

  const caseStudyHeaderEl = document.querySelector(".case-study-header");
  const sectionHeadings = Array.from(
    document.querySelectorAll(".case-study-content h2[id]")
  );
  const subnavLinks = sectionHeadings.map((heading) => {
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    return link;
  });

  if (subnavLinks.length) {
    const subnavEl = document.createElement("nav");
    subnavEl.className = "case-study-subnav";
    subnavEl.setAttribute("aria-label", "Case study sections");
    subnavEl.append(...subnavLinks);
    document.querySelector(".site-header")?.after(subnavEl);
  }

  const updateScrollProgress = () => {
    const scrollingEl = document.scrollingElement || document.documentElement;
    const scrollable = scrollingEl.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? scrollingEl.scrollTop / scrollable : 1;
    progressEl.style.setProperty(
      "--case-study-scroll-progress",
      String(Math.min(Math.max(progress, 0), 1))
    );
  };

  const updateSubnavState = () => {
    if (!caseStudyHeaderEl || !subnavLinks.length) return;

    const headerBottom =
      caseStudyHeaderEl.offsetTop + caseStudyHeaderEl.offsetHeight;
    document.body.classList.toggle(
      "is-case-study-subnav-visible",
      window.scrollY > headerBottom - window.innerHeight * 0.18
    );

    const activeHeading = sectionHeadings
      .slice()
      .reverse()
      .find((heading) => heading.getBoundingClientRect().top <= 140);

    subnavLinks.forEach((link) => {
      const isActive = activeHeading
        ? link.hash === `#${activeHeading.id}`
        : link.hash === `#${sectionHeadings[0].id}`;
      link.classList.toggle("is-active", isActive);
    });
  };

  updateScrollProgress();
  updateSubnavState();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("scroll", updateSubnavState, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  window.addEventListener("resize", updateSubnavState);
  window.addEventListener("pageshow", updateScrollProgress);
  window.addEventListener("pageshow", updateSubnavState);

  initCaseStudyLightbox();
}

const heroSectionEl = document.querySelector(".section--hero");

if (heroSectionEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const resetHeroMouse = () => {
    heroSectionEl.style.setProperty("--hero-mouse-x", "0px");
    heroSectionEl.style.setProperty("--hero-mouse-y", "0px");
  };

  heroSectionEl.addEventListener("pointermove", (event) => {
    const bounds = heroSectionEl.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;

    heroSectionEl.style.setProperty("--hero-mouse-x", `${x}px`);
    heroSectionEl.style.setProperty("--hero-mouse-y", `${y}px`);
  });

  heroSectionEl.addEventListener("pointerleave", resetHeroMouse);
}

const heroHeadingEl = document.getElementById("hero-heading");
const heroClassicCopyEl = document.querySelector(".hero-copy--classic");

if (heroHeadingEl && heroClassicCopyEl) {
  const headings = [
    "Crafting polished, intuitive interfaces with care and precision.",
    "Grounding every design decision in real user research and insight.",
    "Turning complex, messy problems into clear, simple solutions.",
    "Partnering closely with teams to ship work that truly matters.",
  ];

  const mobileHeroMql = window.matchMedia("(max-width: 767px)");

  const syncHeroHeadingHeight = () => {
    if (!mobileHeroMql.matches || rootEl.dataset.heroLayout === "overlap") {
      heroHeadingEl.style.minHeight = "";
      return;
    }

    const currentText = heroClassicCopyEl.textContent;
    let maxHeight = 0;

    headings.forEach((heading) => {
      heroClassicCopyEl.textContent = heading;
      maxHeight = Math.max(maxHeight, heroHeadingEl.offsetHeight);
    });

    heroClassicCopyEl.textContent = currentText;
    heroHeadingEl.style.minHeight = `${maxHeight}px`;
  };

  syncHeroHeadingHeight();
  window.addEventListener("resize", syncHeroHeadingHeight);

  if (mobileHeroMql.addEventListener) {
    mobileHeroMql.addEventListener("change", syncHeroHeadingHeight);
  } else {
    mobileHeroMql.addListener(syncHeroHeadingHeight);
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(syncHeroHeadingHeight);
  }

  let headingIntervalId = null;

  const startHeadingRotation = () => {
    if (reducedMotionMql.matches || rootEl.dataset.heroLayout === "overlap") return;

    const ROTATE_INTERVAL = 8000;
    const FADE_DURATION = 1200;
    const dots = Array.from(document.querySelectorAll(".hero-pagination__dot"));
    let headingIndex = headings.indexOf(heroClassicCopyEl.textContent.trim());
    if (headingIndex === -1) headingIndex = 0;

    const syncDots = () => {
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === headingIndex);
      });
    };

    const showHeading = (nextIndex) => {
      headingIndex = (nextIndex + headings.length) % headings.length;
      syncDots();
      heroHeadingEl.classList.add("is-swapping");

      window.setTimeout(() => {
        heroClassicCopyEl.textContent = headings[headingIndex];
        heroHeadingEl.classList.remove("is-swapping");
      }, FADE_DURATION);
    };

    syncDots();
    headingIntervalId = window.setInterval(
      () => showHeading(headingIndex + 1),
      ROTATE_INTERVAL
    );
  };

  // Classic layout backup: set dataset.heroLayout = "classic" to enable rotation.
  if (rootEl.dataset.heroLayout !== "overlap") {
    startHeadingRotation();
  }
}


if (masonryEl) {
  const renderWorkCardMeta = (project) => {
    const tags = [project.year, project.method, project.device, project.type].filter(
      Boolean
    );

    if (!tags.length) {
      return "";
    }

    return `<p class="work-card__meta">${tags
      .map((tag) => `<span>${tag}</span>`)
      .join('<span class="work-card__meta-sep" aria-hidden="true">·</span>')}</p>`;
  };

  masonryEl.innerHTML = projects
    .map((project) => {
      const imageAlt = project.imageAlt || project.title;
      const media = project.image
        ? project.imageHover
          ? `<div class="work-card__images">
              <img class="work-card__image work-card__image--default" src="${project.image}" alt="${imageAlt}" loading="lazy" decoding="async" />
              <img class="work-card__image work-card__image--hover" src="${project.imageHover}" alt="" loading="lazy" decoding="async" />
            </div>`
          : `<img class="work-card__image" src="${project.image}" alt="${imageAlt}" loading="lazy" decoding="async" />`
        : `<span class="placeholder-label">${project.title}</span>`;

      const badge = project.featured
        ? `<span class="work-card__badge">Featured</span>`
        : "";

      const logoClass = project.logoClass ? ` ${project.logoClass}` : "";
      const logoMarkup = project.logo
        ? `<img class="work-card__logo${logoClass}" src="${project.logo}" alt="" width="28" height="28" loading="lazy" decoding="async" />`
        : "";

      return `
    <li class="work-masonry__item work-masonry__item--${project.size}">
      <a class="work-card" href="${project.href}">
        <div class="work-card__media">
          ${media}
          ${badge}
        </div>
        <div class="work-card__body">
          ${logoMarkup}
          <div class="work-card__copy">
            <h3 class="work-card__title">${project.title}</h3>
            ${renderWorkCardMeta(project)}
          </div>
        </div>
      </a>
    </li>
  `;
    })
    .join("");
}

const nextProjectEl = document.querySelector(".next-project");

if (nextProjectEl && projects.length) {
  const basename = (path) => (path || "").split("?")[0].split("#")[0].split("/").pop();
  const currentFile = basename(window.location.pathname);
  const currentIndex = projects.findIndex(
    (project) => basename(project.href) === currentFile
  );

  if (currentIndex !== -1) {
    const nextProject = projects[(currentIndex + 1) % projects.length];
    nextProjectEl.href = nextProject.href;
    const labelEl = nextProjectEl.querySelector("strong");
    if (labelEl) labelEl.textContent = `${nextProject.title} →`;
  }
}

const experienceMarqueeEl = document.getElementById("experience-marquee");

function formatExperienceYears(item) {
  if (item.years) return item.years;
  if (!item.start) return "";

  const end = item.current ? "Present" : item.end;
  return end ? `${item.start} — ${end}` : item.start;
}

function renderExperienceItem(item) {
  const highlightClass = item.highlighted ? " experience-item--highlighted" : "";
  const logoClass = item.logoClass ? ` ${item.logoClass}` : "";
  const years = formatExperienceYears(item);
  const yearsMarkup = years
    ? `<span class="experience-item__years">${years}</span>`
    : "";

  return `
    <li class="experience-item${highlightClass}">
      <img
        class="experience-item__logo${logoClass}"
        src="${item.logo}"
        alt=""
        width="28"
        height="28"
        loading="lazy"
        decoding="async"
      />
      <span class="experience-item__meta">
        <span class="experience-item__company">${item.company}</span>
        <span class="experience-item__role">${item.role}</span>
        ${yearsMarkup}
      </span>
    </li>
  `;
}

if (experienceMarqueeEl && experience.length) {
  const experienceViewportEl = experienceMarqueeEl.closest(".experience-strip__viewport");
  const experienceMobileMql = window.matchMedia("(max-width: 767px)");
  let experienceResumeTimer = null;
  let experienceInteractionBound = false;

  const pauseExperienceInteraction = () => {
    if (!experienceMobileMql.matches || reducedMotionMql.matches) return;

    window.clearTimeout(experienceResumeTimer);
    experienceViewportEl?.classList.add("is-interactive");
    experienceMarqueeEl.classList.add("is-paused");
  };

  const scheduleExperienceResume = () => {
    if (!experienceMobileMql.matches || reducedMotionMql.matches) return;

    window.clearTimeout(experienceResumeTimer);
    experienceResumeTimer = window.setTimeout(() => {
      if (experienceViewportEl) {
        experienceViewportEl.scrollLeft = 0;
        experienceViewportEl.classList.remove("is-interactive");
      }
      experienceMarqueeEl.classList.remove("is-paused");
    }, 1800);
  };

  const bindExperienceInteraction = () => {
    if (!experienceViewportEl || experienceInteractionBound) return;

    experienceInteractionBound = true;
    experienceViewportEl.addEventListener("pointerdown", pauseExperienceInteraction, {
      passive: true,
    });
    experienceViewportEl.addEventListener("pointerup", scheduleExperienceResume, {
      passive: true,
    });
    experienceViewportEl.addEventListener("pointercancel", scheduleExperienceResume, {
      passive: true,
    });
    experienceViewportEl.addEventListener(
      "scroll",
      () => {
        if (experienceMarqueeEl.classList.contains("is-paused")) {
          scheduleExperienceResume();
        }
      },
      { passive: true }
    );
  };

  const buildMarquee = () => {
    const items = experience.map(renderExperienceItem).join("");
    experienceMarqueeEl.classList.remove("experience-strip__track--auto", "is-paused");
    experienceViewportEl?.classList.remove("is-interactive");

    if (experienceViewportEl) {
      experienceViewportEl.scrollLeft = 0;
    }

    if (reducedMotionMql.matches) {
      experienceMarqueeEl.innerHTML = items;
      experienceMarqueeEl.style.removeProperty("--marquee-end");
      return;
    }

    experienceMarqueeEl.innerHTML = items + items;

    const measureMarquee = () => {
      const loopStart = experienceMarqueeEl.children[experience.length];
      if (!loopStart) return;

      const distance = loopStart.offsetLeft;
      if (distance === 0) {
        requestAnimationFrame(measureMarquee);
        return;
      }

      experienceMarqueeEl.style.setProperty("--marquee-end", `-${distance}px`);
      experienceMarqueeEl.classList.add("experience-strip__track--auto");
    };

    requestAnimationFrame(measureMarquee);
  };

  bindExperienceInteraction();
  buildMarquee();
  window.addEventListener("resize", buildMarquee);

  if (experienceMobileMql.addEventListener) {
    experienceMobileMql.addEventListener("change", buildMarquee);
  } else {
    experienceMobileMql.addListener(buildMarquee);
  }

  if (reducedMotionMql.addEventListener) {
    reducedMotionMql.addEventListener("change", buildMarquee);
  } else {
    reducedMotionMql.addListener(buildMarquee);
  }
}

const toolsGridEl = document.querySelector(".tools-grid");

if (toolsGridEl) {
  const initialToolsMarkup = toolsGridEl.innerHTML;
  const mobileMql = window.matchMedia("(max-width: 767px)");
  const reducedMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");

  const buildToolsCarousel = () => {
    const isOverlapLayout = rootEl.dataset.heroLayout === "overlap";
    const shouldCarousel = mobileMql.matches && !reducedMotionMql.matches && !isOverlapLayout;

    if (!shouldCarousel) {
      toolsGridEl.classList.remove("tools-grid--carousel");
      toolsGridEl.innerHTML = initialToolsMarkup;
      toolsGridEl.style.removeProperty("--tools-scroll-end");
      return;
    }

    toolsGridEl.classList.add("tools-grid--carousel");
    toolsGridEl.innerHTML = initialToolsMarkup + initialToolsMarkup;

    const loopStartIndex = Math.floor(toolsGridEl.children.length / 2);
    const measureCarousel = () => {
      const loopStart = toolsGridEl.children[loopStartIndex];
      if (!loopStart) return;

      const distance = loopStart.offsetLeft;
      if (distance === 0) {
        requestAnimationFrame(measureCarousel);
        return;
      }

      toolsGridEl.style.setProperty("--tools-scroll-end", `-${distance}px`);
    };

    requestAnimationFrame(measureCarousel);

    // Re-measure after remote logos finish loading to keep loop seamless.
    toolsGridEl.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measureCarousel, { once: true });
    });
  };

  buildToolsCarousel();
  window.addEventListener("resize", buildToolsCarousel);

  if (mobileMql.addEventListener) {
    mobileMql.addEventListener("change", buildToolsCarousel);
    reducedMotionMql.addEventListener("change", buildToolsCarousel);
  } else {
    mobileMql.addListener(buildToolsCarousel);
    reducedMotionMql.addListener(buildToolsCarousel);
  }
}

// Sliding pill indicator for desktop nav
const initSiteNavIndicator = () => {
  const navList = document.getElementById("site-nav-list");
  if (!navList || navList.closest(".site-nav__track")) return;

  const track = document.createElement("div");
  track.className = "site-nav__track";
  navList.parentNode?.insertBefore(track, navList);
  track.appendChild(navList);

  const indicator = document.createElement("span");
  indicator.className = "site-nav__indicator";
  indicator.setAttribute("aria-hidden", "true");
  track.prepend(indicator);

  const links = Array.from(navList.querySelectorAll("a"));
  const desktopNavMql = window.matchMedia("(min-width: 768px)");
  const sectionIds = ["hero", "work", "about", "contact"];
  const isCaseStudyPage = document.body.classList.contains("case-study-page");
  let activeSectionId = "";
  let lockedSectionId = null;
  let lockReleaseTimer = null;
  let scrollRaf = null;

  const linkMatchesSection = (link, sectionId) => {
    const href = link.getAttribute("href") || "";
    return href === `#${sectionId}` || href.endsWith(`#${sectionId}`);
  };

  const getLinkForSection = (sectionId) =>
    links.find((link) => linkMatchesSection(link, sectionId));

  const measureIndicator = (activeLink) => {
    const trackRect = track.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    indicator.style.left = `${linkRect.left - trackRect.left}px`;
    indicator.style.width = `${linkRect.width}px`;
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.opacity = "1";
  };

  const moveIndicator = (activeLink) => {
    if (!desktopNavMql.matches || !activeLink) {
      indicator.style.opacity = "0";
      return;
    }

    measureIndicator(activeLink);
  };

  const setActiveSection = (sectionId, { force = false } = {}) => {
    if (!force && sectionId === activeSectionId) return;

    activeSectionId = sectionId;

    links.forEach((link) => {
      const isActive = linkMatchesSection(link, sectionId);
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const activeLink = getLinkForSection(sectionId);
    if (activeLink) moveIndicator(activeLink);
  };

  const lockSection = (sectionId) => {
    lockedSectionId = sectionId;
    window.clearTimeout(lockReleaseTimer);
    lockReleaseTimer = window.setTimeout(() => {
      lockedSectionId = null;
    }, 1000);
  };

  const resolveSectionFromScroll = () => {
    if (isCaseStudyPage) return "work";

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return "hero";

    const activationLine = window.innerHeight * 0.38;
    const activeSection =
      sections.slice().reverse().find((section) => {
        return section.getBoundingClientRect().top <= activationLine;
      }) ?? sections[0];

    return activeSection.id;
  };

  const updateActiveFromScroll = () => {
    if (!desktopNavMql.matches) return;
    if (lockedSectionId) return;

    setActiveSection(resolveSectionFromScroll());
  };

  const scheduleScrollUpdate = () => {
    if (scrollRaf !== null) return;

    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = null;
      updateActiveFromScroll();
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href") || "";
      const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
      const sectionId = hash.replace("#", "");
      if (!sectionId) return;

      lockSection(sectionId);
      setActiveSection(sectionId, { force: true });
    });
  });

  updateActiveFromScroll();
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", () => {
    const activeLink = getLinkForSection(lockedSectionId || activeSectionId);
    if (activeLink) measureIndicator(activeLink);
    updateActiveFromScroll();
  });
  window.addEventListener("pageshow", updateActiveFromScroll);

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", updateActiveFromScroll, { passive: true });
  }

  if (desktopNavMql.addEventListener) {
    desktopNavMql.addEventListener("change", updateActiveFromScroll);
  } else {
    desktopNavMql.addListener(updateActiveFromScroll);
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(updateActiveFromScroll);
  }
};

initSiteNavIndicator();

// Responsive nav: hamburger menu for small screens
const navToggleBtn = document.querySelector("[data-nav-toggle]");
if (navToggleBtn) {
  const navEl = navToggleBtn.closest(".site-nav");
  const navMenuId = navToggleBtn.getAttribute("aria-controls");
  const navMenuEl = navMenuId ? document.getElementById(navMenuId) : null;
  const navListEl = navMenuEl?.querySelector(".site-nav__list") ?? null;

  if (navEl && navMenuEl && navListEl) {
    const iconEl = navToggleBtn.querySelector(".material-symbols-outlined");

    const setOpen = (open) => {
      navEl.classList.toggle("is-open", open);
      document.body.classList.toggle("is-nav-open", open);
      navMenuEl.setAttribute("aria-hidden", open ? "false" : "true");
      navToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      navToggleBtn.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );
      if (iconEl) iconEl.textContent = open ? "close" : "menu";
    };

    setOpen(false);

    navToggleBtn.addEventListener("click", () => {
      const open = !navEl.classList.contains("is-open");
      setOpen(open);
    });

    // Close when navigating
    navListEl.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    // Close on Escape / outside click
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!navEl.classList.contains("is-open")) return;
      const target = e.target;
      if (target instanceof Node && !navEl.contains(target)) setOpen(false);
    });

    // Ensure consistent state when rotating/resizing
    const mql = window.matchMedia("(max-width: 767px)");
    const onMqlChange = () => {
      if (!mql.matches) setOpen(false);
    };
    if (mql.addEventListener) {
      mql.addEventListener("change", onMqlChange);
    } else {
      mql.addListener(onMqlChange);
    }
  }
}
