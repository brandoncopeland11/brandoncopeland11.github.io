const REVEAL_SELECTOR = [
  "main .section:not(.section--hero)",
  ".site-footer",
  ".case-study-content > section",
  ".case-study-content > figure",
  ".case-study-content > .case-study-image-grid",
  ".case-study-content > .next-project",
].join(", ");

const isInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
};

export const initScrollReveal = (reducedMotionMql) => {
  const elements = document.querySelectorAll(REVEAL_SELECTOR);
  if (!elements.length || reducedMotionMql.matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
  );

  elements.forEach((el) => {
    if (isInViewport(el)) return;
    el.classList.add("scroll-reveal");
    observer.observe(el);
  });
};
