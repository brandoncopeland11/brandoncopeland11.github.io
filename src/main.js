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

if (heroHeadingEl) {
  const headings = [
    "Crafting polished, intuitive interfaces with care and precision.",
    "Grounding every design decision in real user research and insight.",
    "Turning complex, messy problems into clear, simple solutions.",
    "Partnering closely with teams to ship work that truly matters.",
  ];

  const mobileHeroMql = window.matchMedia("(max-width: 767px)");

  const syncHeroHeadingHeight = () => {
    if (!mobileHeroMql.matches) {
      heroHeadingEl.style.minHeight = "";
      return;
    }

    const currentText = heroHeadingEl.textContent;
    let maxHeight = 0;

    headings.forEach((heading) => {
      heroHeadingEl.textContent = heading;
      maxHeight = Math.max(maxHeight, heroHeadingEl.offsetHeight);
    });

    heroHeadingEl.textContent = currentText;
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

  if (!reducedMotionMql.matches) {
    const ROTATE_INTERVAL = 8000;
    const FADE_DURATION = 1200;
    const dots = Array.from(document.querySelectorAll(".hero-pagination__dot"));
    let headingIndex = 0;

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
        heroHeadingEl.textContent = headings[headingIndex];
        heroHeadingEl.classList.remove("is-swapping");
      }, FADE_DURATION);
    };

    window.setInterval(() => showHeading(headingIndex + 1), ROTATE_INTERVAL);
  }
}


if (masonryEl) {
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
            ${project.type ? `<p class="work-card__type">${project.type}</p>` : ""}
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
  const buildMarquee = () => {
    const items = experience.map(renderExperienceItem).join("");

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
    };

    requestAnimationFrame(measureMarquee);
  };

  buildMarquee();
  window.addEventListener("resize", buildMarquee);

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
    const shouldCarousel = mobileMql.matches && !reducedMotionMql.matches;

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
