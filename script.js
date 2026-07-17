// Workspace Valet — page behavior

// ── CONFIG ────────────────────────────────────────────────
// Paste the Stripe payment link here once the Stripe account is connected.
// While empty, the deposit button falls back to a pre-filled email request.
const STRIPE_DEPOSIT_URL = "https://book.stripe.com/14A28r5QF44695HgMf5J60R";
const BOOKING_EMAIL = "workspacevalet@greenbookdigital.co";

// ── Pricing ───────────────────────────────────────────────
const BASE_PRICE = 375;      // up to 20 workstations
const BASE_INCLUDED = 20;
const EXTRA_PER_SEAT = 25;

const wsInput = document.getElementById("wsCount");
const calcResult = document.getElementById("calcResult");
const depositBtn = document.getElementById("depositBtn");

function price(count) {
  const extra = Math.max(0, count - BASE_INCLUDED);
  return BASE_PRICE + extra * EXTRA_PER_SEAT;
}

function updateCalc() {
  const count = Math.min(200, Math.max(1, parseInt(wsInput.value, 10) || BASE_INCLUDED));
  const total = price(count);
  calcResult.innerHTML =
    "Your Detail Day: <strong>$" + total + "</strong>" +
    (count > BASE_INCLUDED
      ? " <span style='color:var(--muted)'>($375 + " + (count - BASE_INCLUDED) + " × $25)</span>"
      : "");
  if (STRIPE_DEPOSIT_URL) {
    depositBtn.href = STRIPE_DEPOSIT_URL;
    depositBtn.target = "_blank";
    depositBtn.rel = "noopener";
  } else {
    const subject = encodeURIComponent("Detail Day — hold my date");
    const body = encodeURIComponent(
      "Workstation count: " + count +
      "\nCalculated total: $" + total +
      "\n\nOffice name:\nAddress:\nPreferred dates:\nContact phone:"
    );
    depositBtn.href = "mailto:" + BOOKING_EMAIL + "?subject=" + subject + "&body=" + body;
  }
}
if (wsInput) {
  wsInput.addEventListener("input", updateCalc);
  updateCalc();
}

// ── Nav scroll state ─────────────────────────────────────
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 8);
}, { passive: true });

// ── Mobile menu ──────────────────────────────────────────
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

// ── Reveal on scroll ─────────────────────────────────────
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
}

// ── Sticky mobile CTA after hero ─────────────────────────
const stickyCta = document.getElementById("stickyCta");
const hero = document.querySelector(".hero");
const offer = document.getElementById("offer");
if ("IntersectionObserver" in window) {
  let pastHero = false, inOffer = false;
  const update = () => stickyCta.classList.toggle("show", pastHero && !inOffer);
  new IntersectionObserver(e => { pastHero = !e[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
  new IntersectionObserver(e => { inOffer = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(offer);
}

// ── Video: respect data saver / reduced motion ───────────
const video = document.getElementById("heroVideo");
const saveData = navigator.connection && navigator.connection.saveData;
if (video && (reduceMotion || saveData)) {
  video.removeAttribute("autoplay");
  video.pause();
}
