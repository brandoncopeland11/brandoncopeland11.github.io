const formatDuration = (seconds) => {
  const remaining = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

export const initCollectionAdsPrototype = (root, { showToast }) => {
  const video = root.querySelector("[data-ad-video]");
  const media = video?.querySelector("[data-ad-media]");
  const playBtn = root.querySelector("[data-ad-play]");
  const muteBtn = root.querySelector("[data-ad-mute]");
  const durationEl = root.querySelector("[data-ad-duration]");
  const playIcon = playBtn?.querySelector("[data-ad-icon-play]");
  const pauseIcon = playBtn?.querySelector("[data-ad-icon-pause]");
  const muteIcon = muteBtn?.querySelector("[data-ad-icon-mute]");
  const volumeIcon = muteBtn?.querySelector("[data-ad-icon-volume]");

  if (
    !video ||
    !media ||
    !playBtn ||
    !muteBtn ||
    !durationEl ||
    !playIcon ||
    !pauseIcon ||
    !muteIcon ||
    !volumeIcon
  ) {
    return;
  }

  let duration = 0;
  let playing = false;
  let muted = true;

  const setPlaying = (nextPlaying) => {
    playing = nextPlaying;
    playBtn.setAttribute("aria-pressed", String(playing));
    playBtn.setAttribute(
      "aria-label",
      playing ? "Pause sponsored video" : "Play sponsored video"
    );
    playIcon.toggleAttribute("hidden", playing);
    pauseIcon.toggleAttribute("hidden", !playing);
    video.classList.toggle("is-playing", playing);
  };

  const setMuted = (nextMuted) => {
    muted = nextMuted;
    media.muted = nextMuted;
    muteBtn.setAttribute("aria-pressed", String(muted));
    muteBtn.setAttribute(
      "aria-label",
      muted ? "Unmute sponsored video" : "Mute sponsored video"
    );
    muteIcon.toggleAttribute("hidden", !muted);
    volumeIcon.toggleAttribute("hidden", muted);
  };

  const setRemaining = (seconds) => {
    durationEl.textContent = formatDuration(seconds);
  };

  const syncDuration = () => {
    if (!Number.isFinite(media.duration) || media.duration <= 0) return;
    duration = media.duration;
    syncTimer();
  };

  const syncTimer = () => {
    if (!duration) return;
    const remaining = duration - media.currentTime;
    setRemaining(remaining > 0 ? remaining : 0);
  };

  const playVideo = () => {
    media.play().catch(() => {});
  };

  playBtn.addEventListener("click", () => {
    if (playing) {
      media.pause();
      return;
    }
    playVideo();
  });

  muteBtn.addEventListener("click", () => {
    setMuted(!muted);
  });

  media.addEventListener("loadedmetadata", syncDuration);
  media.addEventListener("durationchange", syncDuration);
  media.addEventListener("timeupdate", syncTimer);

  media.addEventListener("play", () => {
    setPlaying(true);
    syncTimer();
  });

  media.addEventListener("pause", () => {
    setPlaying(false);
    syncTimer();
  });

  media.addEventListener("ended", () => {
    media.currentTime = 0;
    playVideo();
  });

  root.querySelectorAll("[data-ad-brand]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Opens the Kraft brand page");
    });
  });

  root.querySelectorAll("[data-ad-item]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-ad-clip]")) return;
      const name = card.dataset.itemName;
      showToast(name ? `Opens ${name}` : "Opens item details");
    });
  });

  root.querySelectorAll("[data-ad-clip]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const added = button.getAttribute("aria-pressed") === "true";
      const nextAdded = !added;
      const name = button.dataset.itemName || "item";
      const icon = button.querySelector("img");

      button.setAttribute("aria-pressed", String(nextAdded));
      button.setAttribute(
        "aria-label",
        nextAdded ? `Remove ${name} from list` : `Add ${name} to list`
      );
      button.classList.toggle("is-added", nextAdded);

      if (icon) {
        icon.src = nextAdded ? icon.dataset.checkSrc : icon.dataset.addSrc;
      }
    });
  });

  setMuted(true);
  syncDuration();
  setPlaying(!media.paused);
  syncTimer();
  if (media.paused) playVideo();
};
