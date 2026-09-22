import { initAddToListPrototype } from "./prototypes/addToList.js";
import { initCollectionAdsPrototype } from "./prototypes/collectionAds.js";

const PROTOTYPES = {
  "add-to-list": initAddToListPrototype,
  "collection-ads": initCollectionAdsPrototype,
};

const DRAG_THRESHOLD_PX = 6;
const TOAST_DURATION_MS = 2200;

// Touch and trackpads scroll natively; this adds click-and-drag for mouse users.
const initDragScroll = (root) => {
  root.querySelectorAll("[data-prototype-scroll-x]").forEach((rail) => {
    let drag = null;
    let suppressClick = false;

    rail.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = {
        id: event.pointerId,
        x: event.clientX,
        startLeft: rail.scrollLeft,
        active: false,
      };
    });

    rail.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) return;

      const dx = event.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
        drag.active = true;
        rail.setPointerCapture(event.pointerId);
        root.classList.add("is-dragging");
      }

      rail.scrollLeft = drag.startLeft - dx;
    });

    const endDrag = () => {
      if (drag?.active) {
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      }
      drag = null;
      root.classList.remove("is-dragging");
    };

    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true
    );
    rail.addEventListener("dragstart", (event) => event.preventDefault());
  });
};

const createToast = (root) => {
  const screen = root.querySelector(".device-prototype__screen");
  if (!screen) return () => {};

  const toastEl = document.createElement("div");
  toastEl.className = "device-prototype__toast";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  screen.append(toastEl);

  let hideTimer = null;

  return (message) => {
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, TOAST_DURATION_MS);
  };
};

export const initDevicePrototypes = () => {
  document.querySelectorAll("[data-device-prototype]").forEach((root) => {
    initDragScroll(root);

    const init = PROTOTYPES[root.dataset.devicePrototype];
    init?.(root, { showToast: createToast(root) });
  });
};
