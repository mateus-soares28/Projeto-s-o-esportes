const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Abrir menu");
  navigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const galleryStates = [];
const visibilityObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const state = galleryStates.find((item) => item.element === entry.target);
        if (!state) return;
        state.visible = entry.isIntersecting;
        state.sync();
      });
    }, { threshold: 0.1 })
  : null;

document.querySelectorAll("[data-gallery]").forEach((element) => {
  const images = Array.from(element.querySelectorAll(".gallery-image"));
  if (images.length < 2) return;

  const counter = element.querySelector(".gallery-counter");
  const state = {
    element,
    index: 0,
    visible: !visibilityObserver,
    hovered: false,
    timer: null,
    advance() {
      images[state.index].classList.remove("is-active");
      state.index = (state.index + 1) % images.length;
      images[state.index].classList.add("is-active");
      if (counter) {
        counter.textContent = `${String(state.index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
      }
    },
    sync() {
      const shouldRun = state.visible && !state.hovered
        && !document.hidden && !reducedMotion.matches;
      if (shouldRun && !state.timer) {
        state.timer = window.setInterval(state.advance, Number(element.dataset.interval) || 4800);
      } else if (!shouldRun && state.timer) {
        window.clearInterval(state.timer);
        state.timer = null;
      }
    },
  };

  element.addEventListener("mouseenter", () => {
    state.hovered = true;
    state.sync();
  });
  element.addEventListener("mouseleave", () => {
    state.hovered = false;
    state.sync();
  });
  element.addEventListener("focusin", () => {
    state.hovered = true;
    state.sync();
  });
  element.addEventListener("focusout", () => {
    state.hovered = false;
    state.sync();
  });

  galleryStates.push(state);
  if (visibilityObserver) visibilityObserver.observe(element);
  state.sync();
});

document.addEventListener("visibilitychange", () => galleryStates.forEach((state) => state.sync()));
reducedMotion.addEventListener("change", () => galleryStates.forEach((state) => state.sync()));

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// The page remains fully visible if the animation CDN is unavailable.
if (window.gsap && window.ScrollTrigger && !reducedMotion.matches) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.fromTo(".hero-copy-inner", { x: -45, opacity: 0 }, {
    x: 0, opacity: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity",
  });

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    if (element.closest(".hero")) return;
    const fromLeft = element.dataset.reveal === "left";
    gsap.fromTo(element, { x: fromLeft ? -68 : 68, opacity: 0 }, {
      x: 0,
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        end: "top 52%",
        scrub: 0.6,
      },
    });
  });
}
