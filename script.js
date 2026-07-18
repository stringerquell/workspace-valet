// Workspace Valet — page behavior

// ── CONFIG ────────────────────────────────────────────────
// Paste the Stripe payment link here once the Stripe account is connected.
// While empty, the deposit button falls back to a pre-filled email request.
const STRIPE_DEPOSIT_URL = "https://book.stripe.com/14A28r5QF44695HgMf5J60R";
const BOOKING_EMAIL = "readytoserve@workspacevalet.com";

// ── Pricing ───────────────────────────────────────────────
// Founding: $300 covers the first 10, +$20 each for 11–20, capped at 20.
// Standard: $400 covers the first 10, +$35 each for 11–20.
const FOUNDING_BASE = 300, STANDARD_BASE = 400;
const BASE_INCLUDED = 10, CAP = 20;
const FOUNDING_EXTRA = 20, STANDARD_EXTRA = 35;

const wsInput = document.getElementById("wsCount");
const calcResult = document.getElementById("calcResult");
const calcSave = document.getElementById("calcSave");
const depositBtn = document.getElementById("depositBtn");

function founding(count) { return FOUNDING_BASE + Math.max(0, count - BASE_INCLUDED) * FOUNDING_EXTRA; }
function standard(count) { return STANDARD_BASE + Math.max(0, count - BASE_INCLUDED) * STANDARD_EXTRA; }

function updateCalc() {
  const raw = parseInt(wsInput.value, 10) || BASE_INCLUDED;
  const count = Math.min(CAP, Math.max(1, raw));
  const total = founding(count);
  const full = standard(count);
  calcResult.innerHTML =
    "Your Detail Day: <strong>$" + total + "</strong> <s>$" + full + "</s>";
  calcSave.textContent = raw > CAP
    ? "The founding offer covers up to 20 workstations — email us about a larger office."
    : "You save $" + (full - total) + " off the standard rate.";
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

// ── Save UTM params for the assessment ───────────────────
try {
  const p = new URLSearchParams(location.search);
  const utm = JSON.parse(sessionStorage.getItem("wv-utm") || "{}");
  let found = false;
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k => {
    if (p.get(k)) { utm[k] = p.get(k); found = true; }
  });
  if (found) sessionStorage.setItem("wv-utm", JSON.stringify(utm));
} catch (e) { /* ignore */ }

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
