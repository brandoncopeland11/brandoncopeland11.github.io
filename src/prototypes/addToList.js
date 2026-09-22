const FLY_FADE_MS = 280;
const FLY_HOVER_MS = 1200;
const FLY_SHRINK_MS = 360;
const FLY_HOVER_GAP_PX = 8;
const FLY_DURATION_MS = FLY_FADE_MS + FLY_HOVER_MS + FLY_SHRINK_MS;

export const initAddToListPrototype = (root, { showToast }) => {
  const badge = root.querySelector("[data-atl-list-badge]");
  const fly = root.querySelector("[data-atl-fly]");
  const flyImage = fly?.querySelector("img");
  const listsTab = root.querySelector("[data-atl-lists-tab]");
  const listsIcon = listsTab?.querySelector("img");

  if (!badge || !fly || !flyImage || !listsTab || !listsIcon) return;

  let listCount = 0;
  let flyAnimation = null;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateBadge = ({ pop = false } = {}) => {
    if (listCount <= 0) {
      badge.hidden = true;
      badge.textContent = "0";
      listsTab.classList.remove("is-catching");
      return;
    }

    badge.hidden = false;
    badge.textContent = String(listCount);

    if (pop) {
      listsTab.classList.remove("is-catching");
      void listsTab.offsetWidth;
      listsTab.classList.add("is-catching");
    }
  };

  const playFly = () => {
    const shell = root.querySelector(".add-to-list-shell");

    if (!shell) {
      updateBadge({ pop: true });
      return;
    }

    if (prefersReducedMotion()) {
      updateBadge({ pop: true });
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const targetRect = listsIcon.getBoundingClientRect();
    const flyWidth = fly.offsetWidth || 80;
    const flyHeight = fly.offsetHeight || 48;

    const hoverX =
      targetRect.left - shellRect.left + targetRect.width / 2 - flyWidth / 2;
    const hoverY = targetRect.top - shellRect.top - flyHeight - FLY_HOVER_GAP_PX;
    const endX = hoverX;
    const endY = targetRect.top - shellRect.top + targetRect.height / 2 - flyHeight / 2;
    const dy = endY - hoverY;

    fly.style.left = `${hoverX}px`;
    fly.style.top = `${hoverY}px`;

    flyAnimation?.cancel();
    fly.getAnimations().forEach((animation) => animation.cancel());

    const fadeEnd = FLY_FADE_MS / FLY_DURATION_MS;
    const hoverEnd = (FLY_FADE_MS + FLY_HOVER_MS) / FLY_DURATION_MS;

    flyAnimation = fly.animate(
      [
        {
          opacity: 0,
          transform: "translate3d(0, 0, 0) scale(1)",
          offset: 0,
          easing: "ease-out",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          offset: fadeEnd,
          easing: "linear",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          offset: hoverEnd,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
        {
          opacity: 0,
          transform: `translate3d(0, ${dy}px, 0) scale(0.16)`,
          offset: 1,
        },
      ],
      {
        duration: FLY_DURATION_MS,
        fill: "forwards",
      }
    );

    flyAnimation.finished
      .then(() => {
        updateBadge({ pop: true });
        listsTab.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.12)" },
            { transform: "scale(1)" },
          ],
          {
            duration: 280,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        );
      })
      .catch(() => {
        updateBadge({ pop: true });
      });
  };

  const setRowState = (row, state) => {
    row.dataset.atlState = state;
    const addBtn = row.querySelector("[data-atl-add]");
    const qty = row.querySelector("[data-atl-qty]");
    const qtyValue = row.querySelector("[data-atl-qty-value]");
    const itemName = row.dataset.itemName || "item";

    if (addBtn) {
      addBtn.hidden = state !== "add";
      addBtn.setAttribute("aria-pressed", "false");
      addBtn.setAttribute("aria-label", `Add ${itemName} to list`);
    }

    if (qty) {
      qty.hidden = state !== "quantity";
    }

    if (state === "add" && qtyValue) {
      qtyValue.textContent = "1";
    }

    syncQtyControls(row);

    row.querySelector("[data-atl-added]")?.toggleAttribute("hidden", state !== "added");
  };

  const getRowQuantity = (row) => {
    const value = Number(row.querySelector("[data-atl-qty-value]")?.textContent || "1");
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const syncQtyControls = (row) => {
    const qty = getRowQuantity(row);
    const decreaseBtn = row.querySelector("[data-atl-decrease]");
    const trashIcon = row.querySelector("[data-atl-icon-trash]");
    const minusIcon = row.querySelector("[data-atl-icon-minus]");
    const itemName = row.dataset.itemName || "item";
    const showTrash = qty <= 1;

    trashIcon?.toggleAttribute("hidden", !showTrash);
    minusIcon?.toggleAttribute("hidden", showTrash);

    if (decreaseBtn) {
      decreaseBtn.setAttribute(
        "aria-label",
        showTrash ? `Remove ${itemName} from list` : `Decrease quantity of ${itemName}`
      );
    }
  };

  root.querySelectorAll("[data-atl-row]").forEach((row) => {
    const addBtn = row.querySelector("[data-atl-add]");
    const decreaseBtn = row.querySelector("[data-atl-decrease]");
    const increaseBtn = row.querySelector("[data-atl-increase]");
    const qtyValue = row.querySelector("[data-atl-qty-value]");

    addBtn?.addEventListener("click", () => {
      if (row.dataset.atlState !== "add") return;

      setRowState(row, "quantity");
      listCount += 1;
      playFly();
    });

    decreaseBtn?.addEventListener("click", () => {
      if (row.dataset.atlState !== "quantity") return;

      const qty = getRowQuantity(row);

      if (qty <= 1) {
        listCount = Math.max(0, listCount - 1);
        updateBadge();
        setRowState(row, "add");
        return;
      }

      qtyValue.textContent = String(qty - 1);
      listCount = Math.max(0, listCount - 1);
      syncQtyControls(row);
      updateBadge();
    });

    increaseBtn?.addEventListener("click", () => {
      if (row.dataset.atlState !== "quantity" || !qtyValue) return;
      const nextQty = getRowQuantity(row) + 1;
      qtyValue.textContent = String(nextQty);
      listCount += 1;
      syncQtyControls(row);
      updateBadge({ pop: true });
    });

    row.querySelector(".add-to-list-item")?.addEventListener("click", (event) => {
      if (event.target.closest("[data-atl-add], [data-atl-qty], [data-atl-added]")) return;
      const name = row.dataset.itemName;
      showToast(name ? `Opens ${name}` : "Opens item details");
    });
  });

  listsTab.addEventListener("click", () => {
    showToast("Opens your shopping list");
  });

  updateBadge();
};
