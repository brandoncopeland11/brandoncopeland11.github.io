import { storySlides } from "./data/story.js";
import { experience } from "./data/experience.js";
import { createStoryMusic, readSoundPreference, writeSoundPreference } from "./storyMusic.js";
import storyMusicSrc from "./assets/audio/story-music.mp3";
import "./styles/story.css";

const STORY_HASH = "#story";
const RESUME_STORAGE_KEY = "portfolio.story.resumeIndex";
const HOLD_DELAY_MS = 180;
const SWIPE_THRESHOLD_PX = 48;
const CLOSE_ANIMATION_MS = 320;
const COUNT_UP_MS = 900;

const readResumeIndex = () => {
  try {
    const value = Number.parseInt(sessionStorage.getItem(RESUME_STORAGE_KEY) ?? "", 10);
    return Number.isNaN(value) ? null : value;
  } catch {
    return null;
  }
};

const writeResumeIndex = (index) => {
  try {
    if (index === null) sessionStorage.removeItem(RESUME_STORAGE_KEY);
    else sessionStorage.setItem(RESUME_STORAGE_KEY, String(index));
  } catch {
    // Resuming is a nice-to-have; ignore storage failures.
  }
};

const formatTimeLeft = (seconds) => {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, "0");
  return `${minutes}:${secs} left`;
};

const parseStatValue = (value) => {
  const match = String(value).match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], number: Number(match[2]), suffix: match[3] };
};

const renderLinks = (links = [], { variant = "chips" } = {}) => {
  if (!links.length) return "";

  const items = links
    .map((link) => {
      const targetAttrs = link.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      const icon = link.iconPath
        ? `<svg class="story-link__logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${link.iconPath}" /></svg>`
        : link.icon
          ? `<span class="material-symbols-rounded" aria-hidden="true">${link.icon}</span>`
          : "";
      const arrow = link.external ? "arrow_outward" : "arrow_forward";
      const newTabNote = link.external ? '<span class="sr-only">(opens in a new tab)</span>' : "";
      const primaryClass = link.primary ? " story-link--primary" : "";

      return `<a class="story-link${primaryClass}" href="${link.href}"${targetAttrs} data-story-link>
        ${icon}<span>${link.label}</span>${newTabNote}
        <span class="material-symbols-rounded story-link__arrow" aria-hidden="true">${arrow}</span>
      </a>`;
    })
    .join("");

  return `<div class="story-links story-links--${variant}" data-story-animate>${items}</div>`;
};

const renderStats = (stats = []) => {
  if (!stats.length) return "";

  return `<dl class="story-stats story-stats--${stats.length}">
    ${stats
      .map(
        (stat, index) => `<div class="story-stat" data-story-animate style="--story-stat-index: ${index}">
          <dt class="story-stat__value" data-count-to="${stat.value}">${stat.value}</dt>
          <dd class="story-stat__label">${stat.label}</dd>
        </div>`
      )
      .join("")}
  </dl>`;
};

const renderPillars = (pillars = []) => `<ul class="story-pillars">
  ${pillars
    .map(
      (pillar) => `<li class="story-pillar" data-story-animate>
        <span class="material-symbols-rounded story-pillar__icon" aria-hidden="true">${pillar.icon}</span>
        <span class="story-pillar__copy">
          <strong>${pillar.title}</strong>
          <span>${pillar.body}</span>
        </span>
      </li>`
    )
    .join("")}
</ul>`;

const renderTimeline = () => `<ol class="story-timeline">
  ${experience
    .map(
      (item, index) => `<li class="story-timeline__item${index === 0 ? " is-current" : ""}" data-story-animate>
        <span class="story-timeline__logo">
          <img src="${item.logo}" alt="" width="28" height="28" decoding="async" />
        </span>
        <span class="story-timeline__copy">
          <strong>${item.company}</strong>
          <span>${item.role}</span>
        </span>
        <span class="story-timeline__years">${item.years}</span>
      </li>`
    )
    .join("")}
</ol>`;

const renderHeading = (slide, headingId) => `
  <p class="story-slide__kicker" data-story-animate>
    ${slide.logo ? `<img class="story-slide__logo" src="${slide.logo}" alt="" width="20" height="20" decoding="async" />` : ""}
    <span>${slide.kicker}</span>
  </p>
  <h2 class="story-slide__title" id="${headingId}" data-story-animate>${slide.title}</h2>
  ${slide.body ? `<p class="story-slide__body" data-story-animate>${slide.body}</p>` : ""}
`;

const renderSlide = (slide, index) => {
  const headingId = `story-slide-${slide.id}-title`;
  let copy = renderHeading(slide, headingId);
  let visual = "";

  if (slide.kind === "intro" || slide.kind === "outro") {
    visual = `<div class="story-portrait" data-story-animate>
      <span class="story-portrait__ring" aria-hidden="true"></span>
      <img src="${slide.photo}" alt="Portrait of Brandon Copeland" width="320" height="400" decoding="async" />
    </div>`;
  }

  if (slide.kind === "intro") {
    copy += `<p class="story-slide__hint" data-story-animate>
      <span class="material-symbols-rounded" aria-hidden="true">touch_app</span>
      Tap or use arrow keys to move, hold to pause.
    </p>`;
  }

  if (slide.kind === "stats") copy += renderStats(slide.stats);
  if (slide.kind === "pillars") copy += renderPillars(slide.pillars);
  if (slide.kind === "timeline") visual = renderTimeline();

  if (slide.kind === "case") {
    copy += renderStats(slide.stats);
    if (slide.quote) {
      copy += `<blockquote class="story-quote" data-story-animate>"${slide.quote}"</blockquote>`;
    }
    copy += renderLinks(slide.links);
    visual = `<figure class="story-visual" data-story-animate>
      <img src="${slide.image}" alt="${slide.imageAlt}" decoding="async" loading="lazy" />
    </figure>`;
  }

  if (slide.kind === "outro") {
    copy += renderLinks(slide.links, { variant: "actions" });
    copy += `<button class="story-replay" type="button" data-story-replay data-story-animate>
      <span class="material-symbols-rounded" aria-hidden="true">replay</span>
      Watch again
    </button>`;
  }

  return `<section
    class="story-slide story-slide--${slide.kind}${visual ? " story-slide--has-visual" : ""}"
    data-story-slide="${index}"
    aria-labelledby="${headingId}"
    aria-roledescription="slide"
    inert
  >
    <div class="story-slide__copy">${copy}</div>
    ${visual ? `<div class="story-slide__visual">${visual}</div>` : ""}
  </section>`;
};

const renderStory = () => `
  <div class="story__bg" aria-hidden="true">
    <span class="story__glow story__glow--one"></span>
    <span class="story__glow story__glow--two"></span>
    <span class="story__glow story__glow--three"></span>
    <span class="story__grain"></span>
  </div>
  <div class="story__chrome">
    <div class="story__progress" role="group" aria-label="Story chapters">
      ${storySlides
        .map(
          (slide, index) => `<button
            class="story__segment"
            type="button"
            data-story-goto="${index}"
            aria-label="Go to slide ${index + 1}: ${slide.chapter}"
            style="--story-duration: ${slide.duration}s"
          ><span class="story__segment-fill"></span></button>`
        )
        .join("")}
    </div>
    <div class="story__header">
      <div class="story__identity">
        <img class="story__avatar" src="${storySlides[0].photo}" alt="" width="36" height="36" decoding="async" />
        <span class="story__identity-copy">
          <strong>Brandon Copeland</strong>
          <span><span data-story-chapter>${storySlides[0].chapter}</span> · <span data-story-time></span></span>
        </span>
      </div>
      <div class="story__controls">
        <button class="story__control story__control--sound" type="button" data-story-sound aria-label="Mute music">
          <span class="material-symbols-rounded" aria-hidden="true">volume_up</span>
        </button>
        <button class="story__control" type="button" data-story-toggle aria-label="Pause story">
          <span class="material-symbols-rounded" aria-hidden="true">pause</span>
        </button>
        <button class="story__control" type="button" data-story-close aria-label="Close story">
          <span class="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      </div>
    </div>
  </div>
  <div class="story__stage" data-story-stage tabindex="-1">
    ${storySlides.map(renderSlide).join("")}
  </div>
  <button class="story__nav story__nav--prev" type="button" data-story-prev aria-label="Previous slide">
    <span class="material-symbols-rounded" aria-hidden="true">chevron_left</span>
  </button>
  <button class="story__nav story__nav--next" type="button" data-story-next aria-label="Next slide">
    <span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>
  </button>
  <p class="sr-only" aria-live="polite" data-story-announcer></p>
`;

export const initStory = (reducedMotionMql) => {
  const triggers = Array.from(document.querySelectorAll("[data-story-open]"));
  if (!triggers.length || !storySlides.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "story";
  dialog.id = "story";
  dialog.setAttribute("aria-label", "Get to know Brandon in 2 minutes");
  dialog.innerHTML = renderStory();
  document.body.append(dialog);

  const stage = dialog.querySelector("[data-story-stage]");
  const slideEls = Array.from(dialog.querySelectorAll("[data-story-slide]"));
  const segmentEls = Array.from(dialog.querySelectorAll("[data-story-goto]"));
  const toggleBtn = dialog.querySelector("[data-story-toggle]");
  const toggleIcon = toggleBtn.querySelector(".material-symbols-rounded");
  const chapterEl = dialog.querySelector("[data-story-chapter]");
  const timeEl = dialog.querySelector("[data-story-time]");
  const announcerEl = dialog.querySelector("[data-story-announcer]");
  const totalSeconds = storySlides.reduce((sum, slide) => sum + slide.duration, 0);

  slideEls.forEach((slideEl) => {
    slideEl.querySelectorAll("[data-story-animate]").forEach((el, i) => {
      el.style.setProperty("--story-i", String(i));
    });
  });

  let currentIndex = 0;
  let isPaused = false;
  let isHolding = false;
  let isClosing = false;
  let countUpFrame = null;
  let timeTicker = null;
  let returnFocusEl = null;
  let hasStoryHistoryEntry = false;
  let isSoundOn = readSoundPreference();
  let isAwaitingSoundGesture = false;

  const music = createStoryMusic({ src: storyMusicSrc });
  const soundBtn = dialog.querySelector("[data-story-sound]");
  const soundIcon = soundBtn.querySelector(".material-symbols-rounded");

  const syncSoundButton = () => {
    const isAudible = isSoundOn && !isAwaitingSoundGesture;
    soundIcon.textContent = isAudible ? "volume_up" : "volume_off";
    soundBtn.setAttribute("aria-label", isAudible ? "Mute music" : "Play music");
    soundBtn.classList.toggle("is-awaiting", isAwaitingSoundGesture);
  };

  // Browsers block audio until the visitor interacts (e.g. landing on /#story directly).
  const retryMusicOnGesture = () => {
    if (isAwaitingSoundGesture) return;
    isAwaitingSoundGesture = true;
    syncSoundButton();

    const retry = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-story-sound]")) return;
      dialog.removeEventListener("pointerdown", retry);
      dialog.removeEventListener("keydown", retry);
      isAwaitingSoundGesture = false;
      syncMusic();
    };
    dialog.addEventListener("pointerdown", retry);
    dialog.addEventListener("keydown", retry);
  };

  const syncMusic = () => {
    const shouldPlay = dialog.open && !isClosing && isSoundOn && !isPaused;
    syncSoundButton();

    if (!shouldPlay) {
      music.pause();
      return;
    }

    music.play().then((started) => {
      if (!started) retryMusicOnGesture();
    });
  };

  const setSoundOn = (on) => {
    isSoundOn = on;
    isAwaitingSoundGesture = false;
    writeSoundPreference(on);
    syncMusic();
  };

  const activeFill = () => segmentEls[currentIndex]?.querySelector(".story__segment-fill");

  const getElapsedInSlide = () => {
    const fill = activeFill();
    const animation = fill?.getAnimations?.()[0];
    const ms = typeof animation?.currentTime === "number" ? animation.currentTime : 0;
    return ms / 1000;
  };

  const updateTimeLeft = () => {
    const before = storySlides
      .slice(0, currentIndex)
      .reduce((sum, slide) => sum + slide.duration, 0);
    timeEl.textContent = formatTimeLeft(totalSeconds - before - getElapsedInSlide());
  };

  const syncPlayState = () => {
    const paused = isPaused || isHolding;
    dialog.classList.toggle("is-paused", paused);
    toggleBtn.setAttribute("aria-label", isPaused ? "Play story" : "Pause story");
    toggleIcon.textContent = isPaused ? "play_arrow" : "pause";
  };

  const runCountUp = (slideEl) => {
    window.cancelAnimationFrame(countUpFrame);
    const statEls = Array.from(slideEl.querySelectorAll("[data-count-to]"));
    const parsed = statEls.map((el) => ({ el, value: parseStatValue(el.dataset.countTo) }));

    if (reducedMotionMql.matches) {
      parsed.forEach(({ el }) => (el.textContent = el.dataset.countTo));
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      parsed.forEach(({ el, value }) => {
        if (!value) return;
        el.textContent = `${value.prefix}${Math.round(value.number * eased)}${value.suffix}`;
      });
      if (progress < 1) countUpFrame = window.requestAnimationFrame(tick);
    };
    countUpFrame = window.requestAnimationFrame(tick);
  };

  const preloadSlideImages = (index) => {
    slideEls[index]?.querySelectorAll("img[loading='lazy']").forEach((img) => {
      img.loading = "eager";
    });
  };

  const applyColors = (slide) => {
    slide.colors.forEach((color, i) => dialog.style.setProperty(`--story-c${i + 1}`, color));
  };

  const goTo = (index, { announce = true } = {}) => {
    const nextIndex = Math.max(0, Math.min(storySlides.length - 1, index));
    const direction = nextIndex >= currentIndex ? "forward" : "back";
    currentIndex = nextIndex;
    const slide = storySlides[currentIndex];

    dialog.dataset.direction = direction;
    applyColors(slide);
    chapterEl.textContent = slide.chapter;

    slideEls.forEach((el, i) => {
      const isActive = i === currentIndex;
      el.classList.toggle("is-active", isActive);
      el.toggleAttribute("inert", !isActive);
      el.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    segmentEls.forEach((el, i) => {
      el.classList.toggle("is-done", i < currentIndex);
      el.classList.toggle("is-active", i === currentIndex);
      if (i === currentIndex) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });

    // Restart the active segment's fill animation; its animationend drives auto-advance.
    const fill = activeFill();
    if (fill) {
      fill.style.animation = "none";
      void fill.offsetWidth;
      fill.style.animation = "";
    }

    preloadSlideImages(currentIndex);
    preloadSlideImages(currentIndex + 1);
    runCountUp(slideEls[currentIndex]);
    updateTimeLeft();

    dialog.classList.toggle("is-first", currentIndex === 0);
    dialog.classList.toggle("is-last", currentIndex === storySlides.length - 1);

    if (announce) {
      announcerEl.textContent = `Slide ${currentIndex + 1} of ${storySlides.length}: ${slide.title}`;
    }
  };

  const next = () => {
    if (currentIndex < storySlides.length - 1) goTo(currentIndex + 1);
  };

  const prev = () => goTo(currentIndex - 1);

  const setPaused = (paused) => {
    isPaused = paused;
    syncPlayState();
    syncMusic();
  };

  const clearStoryHash = () => {
    if (window.location.hash !== STORY_HASH) return;
    if (hasStoryHistoryEntry) {
      hasStoryHistoryEntry = false;
      window.history.back();
      return;
    }
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", `${pathname}${search}`);
  };

  const open = ({ startIndex = 0 } = {}) => {
    if (dialog.open) return;

    returnFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isClosing = false;
    isHolding = false;
    dialog.classList.remove("is-closing");
    document.body.classList.add("is-story-open");

    if (window.location.hash !== STORY_HASH) {
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", `${pathname}${search}${STORY_HASH}`);
    }

    dialog.showModal();
    if (startIndex === 0) music.restart();
    goTo(startIndex);
    setPaused(false);
    stage.focus({ preventScroll: true });

    window.clearInterval(timeTicker);
    timeTicker = window.setInterval(updateTimeLeft, 500);
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!dialog.open || isClosing) return;

    isClosing = true;
    window.clearInterval(timeTicker);
    window.cancelAnimationFrame(countUpFrame);
    clearStoryHash();
    syncMusic();

    const finish = () => {
      dialog.close();
      dialog.classList.remove("is-closing");
      document.body.classList.remove("is-story-open");
      isClosing = false;
      if (restoreFocus) returnFocusEl?.focus({ preventScroll: true });
    };

    if (reducedMotionMql.matches) {
      finish();
      return;
    }

    dialog.classList.add("is-closing");
    window.setTimeout(finish, CLOSE_ANIMATION_MS);
  };

  // Triggers are plain #story links so Back closes the story.
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      // Start audio inside the click so Safari counts it as user-initiated.
      if (isSoundOn) {
        music.restart();
        music.play();
      }
      if (window.location.hash === STORY_HASH) open();
    });
  });

  dialog.addEventListener("animationend", (event) => {
    if (!event.target.classList?.contains("story__segment-fill")) return;
    if (event.target !== activeFill()) return;
    if (currentIndex < storySlides.length - 1) next();
    else setPaused(true);
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  dialog.querySelector("[data-story-close]").addEventListener("click", () => close());
  dialog.querySelector("[data-story-prev]").addEventListener("click", prev);
  dialog.querySelector("[data-story-next]").addEventListener("click", next);
  toggleBtn.addEventListener("click", () => setPaused(!isPaused));
  soundBtn.addEventListener("click", () => setSoundOn(!isSoundOn || isAwaitingSoundGesture));

  segmentEls.forEach((el) => {
    el.addEventListener("click", () => goTo(Number(el.dataset.storyGoto)));
  });

  dialog.querySelector("[data-story-replay]")?.addEventListener("click", () => {
    music.restart();
    goTo(0);
    setPaused(false);
  });

  dialog.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("[data-story-link]") : null;
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    const isSamePage = url.origin === window.location.origin && url.pathname === window.location.pathname;

    if (isSamePage && url.hash) {
      event.preventDefault();
      close({ restoreFocus: false });
      window.setTimeout(() => {
        document.querySelector(url.hash)?.scrollIntoView({
          behavior: reducedMotionMql.matches ? "auto" : "smooth",
        });
      }, reducedMotionMql.matches ? 0 : CLOSE_ANIMATION_MS);
      return;
    }

    if (link.target === "_blank" || url.protocol === "mailto:") {
      setPaused(true);
      return;
    }

    // Leaving for a case study: come back to this slide if they hit Back.
    writeResumeIndex(currentIndex);
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.target instanceof Element && event.target.closest("a, button") && event.key === " ") return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === " " || event.key === "k") {
      event.preventDefault();
      setPaused(!isPaused);
    } else if (event.key === "m") {
      setSoundOn(!isSoundOn || isAwaitingSoundGesture);
    }
  });

  // Tap left third to go back, anywhere else to go forward, hold to pause, swipe to navigate.
  let pointerStart = null;
  let holdTimer = null;

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;

    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => {
      isHolding = true;
      syncPlayState();
    }, HOLD_DELAY_MS);
  });

  const endPointer = (event, { cancelled = false } = {}) => {
    if (!pointerStart || event.pointerId !== pointerStart.id) return;

    window.clearTimeout(holdTimer);
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const wasHolding = isHolding;
    pointerStart = null;

    if (wasHolding) {
      isHolding = false;
      syncPlayState();
    }

    if (cancelled) return;

    if (Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
      return;
    }

    if (dy > SWIPE_THRESHOLD_PX * 2 && Math.abs(dy) > Math.abs(dx)) {
      close();
      return;
    }

    if (wasHolding || Math.abs(dx) > 8 || Math.abs(dy) > 8) return;
    if (window.getSelection()?.toString()) return;

    const bounds = stage.getBoundingClientRect();
    if (event.clientX - bounds.left < bounds.width / 3) prev();
    else next();
  };

  stage.addEventListener("pointerup", (event) => endPointer(event));
  stage.addEventListener("pointercancel", (event) => endPointer(event, { cancelled: true }));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && dialog.open) setPaused(true);
  });

  window.addEventListener("hashchange", () => {
    if (window.location.hash === STORY_HASH) {
      hasStoryHistoryEntry = true;
      open();
    } else if (dialog.open) {
      hasStoryHistoryEntry = false;
      close();
    }
  });

  const resumeIndex = readResumeIndex();
  writeResumeIndex(null);

  if (window.location.hash === STORY_HASH) {
    const startIndex =
      resumeIndex !== null && resumeIndex < storySlides.length ? resumeIndex : 0;
    open({ startIndex });
  }
};
