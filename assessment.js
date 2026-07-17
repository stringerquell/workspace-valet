// A-Player Workspace Assessment — quiz engine (spec v2)
// 8 scored questions (0–3 pts, max 24) + result gate + 4 fit questions.
// Answers persist in sessionStorage; submission posts to /api/assessment.

const TOTAL_QUESTIONS = 14; // 8 scored + gate (2) + role + outcome + obstacles + timing
const MAX_POINTS = 24;

const DIMS = {
  presentation: { label: "Presentation and Readiness", max: 3 },
  careSystem:   { label: "Care System", max: 12 },
  stewardship:  { label: "Equipment Stewardship and Trust", max: 9 }
};

const SCORED = [
  { dim: "careSystem",
    q: "How often do all laptops, screens, keyboards, docks, phones, and workstation surfaces receive coordinated professional care?",
    opts: [
      ["On a set schedule at least several times per year.", 3],
      ["Occasionally, or when the office needs a larger reset.", 2],
      ["Individual employees or the cleaning team handle parts of it when needed.", 1],
      ["There is no defined cadence, or I do not know.", 0]
    ]},
  { dim: "presentation",
    q: "Honestly speaking, do you think each employee\u2019s workstation matches the standard of your lobby, conference rooms, and shared spaces?",
    opts: [
      ["Every workstation receives the same level of attention as our client-facing spaces.", 3],
      ["Most workstations match, but the condition varies by employee or area.", 2],
      ["Our shared spaces present better than many individual workstations.", 1],
      ["We have not compared them closely.", 0]
    ]},
  { dim: "careSystem",
    q: "Who is responsible for workstation care and detailing?",
    opts: [
      ["A named person or vendor follows a clear protocol and confirms completion.", 3],
      ["An office or operations leader coordinates it when needed.", 2],
      ["Employees are expected to manage their own workstations.", 1],
      ["Responsibility is unclear.", 0]
    ]},
  { dim: "careSystem",
    q: "Can you verify that every workstation receives the same level of care?",
    opts: [
      ["Yes. We use a checklist, schedule, or completion record.", 3],
      ["Probably, but the work is not documented.", 2],
      ["The standard varies between teams or employees.", 1],
      ["No, or we have no way to verify it.", 0]
    ]},
  { dim: "careSystem",
    q: "What happens when a workstation is shared, reassigned, or prepared for a new employee?",
    note: "No shared desks? Think of employee departures, equipment reassignment, and new-hire preparation.",
    opts: [
      ["It receives a documented reset that includes the equipment and desk setup.", 3],
      ["It receives a general reset, but the process is informal.", 2],
      ["The next employee or manager handles what they notice.", 1],
      ["We do not have a defined reset process.", 0]
    ]},
  { dim: "stewardship",
    q: "What rules protect company data when someone cleans or handles workstation equipment?",
    opts: [
      ["Devices are shut down or locked, passwords are never shared, and the protocol is documented.", 3],
      ["We follow a consistent expectation, but it is not formally documented.", 2],
      ["The approach depends on the employee, vendor, or situation.", 1],
      ["We do not have specific rules for this.", 0]
    ]},
  { dim: "stewardship",
    q: "How are vents, ports, docks, monitor edges, and cable areas handled?",
    opts: [
      ["They are included in a recurring inspection and external-care process.", 3],
      ["They are addressed during office resets or equipment moves.", 2],
      ["They are handled when someone notices visible buildup or disorder.", 1],
      ["They receive little or no attention.", 0]
    ]},
  { dim: "stewardship",
    q: "What usually happens when dust, smudges, crumbs, or cable disorder become visible?",
    opts: [
      ["Our care schedule catches most issues before they become noticeable.", 3],
      ["Someone handles the issue within a few days.", 2],
      ["It waits until an employee or manager decides to address it.", 1],
      ["It often remains until a complaint, equipment move, or larger office reset.", 0]
    ]}
];

const ROLE_OPTS = [
  "Founder, owner, or managing partner",
  "Operations or workplace leader",
  "Office manager or executive assistant",
  "People, culture, or HR leader",
  "IT, facilities, or security leader",
  "Employee or team lead",
  "Other"
];

const OUTCOME_OPTS = [
  "A consistent standard across every workstation",
  "A better everyday experience for employees",
  "A stronger impression for clients and candidates",
  "Better professional care for our equipment",
  "Less internal coordination and follow-up",
  "I am exploring what needs attention"
];

const OBSTACLE_OPTS = [
  "We do not have a clear workstation-care standard.",
  "Employees are expected to handle their own equipment.",
  "Our current cleaning service does not specialize in workstation technology.",
  "Data privacy and device access are concerns.",
  "We cannot disrupt the workday.",
  "We did not know a professional service like this existed.",
  "We have not made it a priority yet.",
  "Other"
];

const TIMING_OPTS = [
  "ASAP",
  "1–3 months",
  "3–6 months",
  "Just exploring options"
];

// Bands keep the original cut lines (80% / 50%) rescaled to 24 points.
const PROFILES = [
  { min: 20, name: "Performance-Ready Office",
    meaning: "Your company already treats its work environment as part of performance, employee experience, and presentation. Workstation care is more consistent than it is in most offices.",
    steps: [
      "Protect the current standard with a documented recurring cadence.",
      "Confirm that shared desks, conference-room technology, and new-hire workstations follow the same process.",
      "Use a professional baseline Detail Day to document the condition of every workstation and identify visible exceptions."
    ]},
  { min: 12, name: "High-Standard Office Without a System",
    meaning: "Your company cares about its environment and expects high-quality work, but workstation care depends on individuals, occasional resets, or informal coordination.",
    steps: [
      "Establish one visible standard across every workstation.",
      "Complete a professional baseline detail instead of asking employees to fix desks one by one.",
      "Choose a repeatable care cadence and document who confirms completion."
    ]},
  { min: 0, name: "Polished Office With Overlooked Workstations",
    meaning: "Your company may invest in its lobby, conference rooms, furniture, and technology while the workstations receive inconsistent attention. The fastest improvement is making the current condition visible and setting a baseline.",
    steps: [
      "Complete the 60-Second Workstation Walk and record the three most visible inconsistencies.",
      "Start with the shared desks, reception stations, conference-room technology, and areas visitors can see.",
      "Use the Office Manager Protocol internally or reserve a professional Detail Day to bring every workstation to one standard."
    ]}
];

const DIM_RECO = {
  presentation: "Walk the office from the perspective of a candidate or client. Compare the workstations with the lobby and conference rooms, then document the three clearest inconsistencies.",
  careSystem: "Replace informal, employee-by-employee care with one standard, one cadence, and one completion process across the office.",
  stewardship: "Establish a privacy-safe external-care protocol covering device shutdown or locking, password boundaries, approved products, and visible equipment checks."
};

const OUTCOME_RECO = {
  [OUTCOME_OPTS[0]]: "Your first move is bringing every workstation to the same visible standard.",
  [OUTCOME_OPTS[1]]: "Your first move is defining what “ready for work” should feel like when someone sits down.",
  [OUTCOME_OPTS[2]]: "Your first move is reviewing every workstation a visitor could see or use.",
  [OUTCOME_OPTS[3]]: "Your first move is establishing a safe, recurring external-care process.",
  [OUTCOME_OPTS[4]]: "Your first move is assigning the full standard to one documented process instead of several people.",
  [OUTCOME_OPTS[5]]: "Your first move is completing the 60-Second Workstation Walk."
};

// ── State ─────────────────────────────────────────────────
const STORE_KEY = "wv-assessment-v2";
let state = { step: "intro", scored: Array(8).fill(null), firstName: "", email: "",
              role: null, outcome: null, obstacles: [], obstacleOther: "", timing: null };
try {
  const saved = JSON.parse(sessionStorage.getItem(STORE_KEY));
  if (saved && Array.isArray(saved.scored) && saved.scored.length === 8) state = saved;
} catch (e) { /* fresh start */ }

// Capture UTMs (from this URL or ones the homepage saved)
const params = new URLSearchParams(location.search);
const utm = JSON.parse(sessionStorage.getItem("wv-utm") || "{}");
["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k => {
  if (params.get(k)) utm[k] = params.get(k);
});
sessionStorage.setItem("wv-utm", JSON.stringify(utm));

function save() { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function track(name) { window.va && window.va("event", { name }); }

// ── Elements ──────────────────────────────────────────────
const el = id => document.getElementById(id);
const cards = { intro: el("introCard"), question: el("questionCard"),
                gate: el("gateCard"), result: el("resultCard") };

function show(card) {
  Object.values(cards).forEach(c => c.hidden = true);
  cards[card].hidden = false;
  window.scrollTo({ top: 0, behavior: "instant" });
}

function setProgress(n) {
  el("quizProgress").hidden = false;
  el("progressFill").style.width = Math.round(n / TOTAL_QUESTIONS * 100) + "%";
  el("progressLabel").textContent = "Question " + n + " of " + TOTAL_QUESTIONS;
}

// ── Question rendering ────────────────────────────────────
// Steps: q1..q8 scored, gate (9+10), q11 role, q12 outcome,
//        q13 obstacles (multi), q14 service timing
function render() {
  save();
  const s = state.step;
  if (s === "intro") { el("quizProgress").hidden = true; return show("intro"); }
  if (s === "gate") { setProgress(9); return show("gate"); }
  if (s === "result") { el("quizProgress").hidden = true; return renderResult(); }

  const idx = parseInt(s.slice(1), 10); // q1..q14
  show("question");
  el("qNote").hidden = true;
  el("nextBtn").hidden = true;
  el("backBtn").style.visibility = idx === 1 ? "hidden" : "visible";

  if (idx <= 8) {
    setProgress(idx);
    const q = SCORED[idx - 1];
    el("qNum").textContent = "Question " + idx + " of " + TOTAL_QUESTIONS;
    el("qText").textContent = q.q;
    if (q.note) { el("qNote").textContent = q.note; el("qNote").hidden = false; }
    renderOptions(q.opts.map(o => o[0]), state.scored[idx - 1], choice => {
      state.scored[idx - 1] = choice;
      state.step = idx === 8 ? "gate" : "q" + (idx + 1);
      if (idx === 8) track("assessment_scored_questions_completed");
      render();
    });
  } else if (idx === 11) {
    setProgress(11);
    el("qNum").textContent = "Question 11 of " + TOTAL_QUESTIONS;
    el("qText").textContent = "Which best describes your role?";
    renderOptions(ROLE_OPTS, state.role === null ? null : ROLE_OPTS.indexOf(state.role), choice => {
      state.role = ROLE_OPTS[choice];
      state.step = "q12";
      render();
    });
  } else if (idx === 12) {
    setProgress(12);
    el("qNum").textContent = "Question 12 of " + TOTAL_QUESTIONS;
    el("qText").textContent = "What would make your office life easier when it comes to workspace detailing?";
    renderOptions(OUTCOME_OPTS, state.outcome === null ? null : OUTCOME_OPTS.indexOf(state.outcome), choice => {
      state.outcome = OUTCOME_OPTS[choice];
      state.step = "q13";
      render();
    });
  } else if (idx === 13) {
    setProgress(13);
    el("qNum").textContent = "Question 13 of " + TOTAL_QUESTIONS + " · Select all that apply";
    el("qText").textContent = "What has made consistent workstation care difficult?";
    renderMulti();
  } else if (idx === 14) {
    setProgress(14);
    el("qNum").textContent = "Question 14 of " + TOTAL_QUESTIONS;
    el("qText").textContent = "How soon might you need valet service?";
    renderOptions(TIMING_OPTS, state.timing === null ? null : TIMING_OPTS.indexOf(state.timing), choice => {
      state.timing = TIMING_OPTS[choice];
      save();
      const next = el("nextBtn");
      next.innerHTML = 'Show My Results <span class="arrow">→</span>';
      next.onclick = finish;
      next.hidden = false;
    });
    if (state.timing !== null) {
      const next = el("nextBtn");
      next.innerHTML = 'Show My Results <span class="arrow">→</span>';
      next.onclick = finish;
      next.hidden = false;
    }
  }
}

function renderOptions(labels, selectedIdx, onPick) {
  const box = el("qOptions");
  box.innerHTML = "";
  labels.forEach((label, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "quiz-option" + (selectedIdx === i ? " selected" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
      box.querySelectorAll(".quiz-option").forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      setTimeout(() => onPick(i), 160);
    });
    box.appendChild(b);
  });
}

function renderMulti() {
  const box = el("qOptions");
  box.innerHTML = "";
  OBSTACLE_OPTS.forEach(label => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "quiz-option quiz-multi" + (state.obstacles.includes(label) ? " selected" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
      const on = state.obstacles.includes(label);
      state.obstacles = on ? state.obstacles.filter(x => x !== label) : [...state.obstacles, label];
      b.classList.toggle("selected", !on);
      otherField.hidden = !state.obstacles.includes("Other");
      el("nextBtn").hidden = state.obstacles.length === 0;
      save();
    });
    box.appendChild(b);
  });
  const otherField = document.createElement("div");
  otherField.className = "quiz-field";
  otherField.hidden = !state.obstacles.includes("Other");
  otherField.innerHTML = '<label for="otherText">Tell us more (optional)</label><input type="text" id="otherText" maxlength="250">';
  box.appendChild(otherField);
  otherField.querySelector("input").value = state.obstacleOther;
  otherField.querySelector("input").addEventListener("input", e => {
    state.obstacleOther = e.target.value; save();
  });
  const next = el("nextBtn");
  next.hidden = state.obstacles.length === 0;
  next.innerHTML = 'Continue <span class="arrow">→</span>';
  next.onclick = () => { state.step = "q14"; render(); };
}

// ── Back navigation ───────────────────────────────────────
el("backBtn").addEventListener("click", () => {
  const idx = parseInt(state.step.slice(1), 10);
  if (idx === 11) state.step = "gate";
  else if (idx > 1) state.step = "q" + (idx - 1);
  render();
});
el("gateBack").addEventListener("click", () => { state.step = "q8"; render(); });

// ── Start ─────────────────────────────────────────────────
el("startBtn").addEventListener("click", () => {
  track("assessment_started");
  state.step = "q1";
  render();
});

// ── Result gate ───────────────────────────────────────────
el("gateForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = el("firstName").value.trim();
  const email = el("email").value.trim();
  const valid = name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  el("gateError").hidden = valid;
  if (!valid) return;
  state.firstName = name;
  state.email = email;
  track("assessment_lead_captured");
  state.step = "q11";
  render();
});

// ── Scoring ───────────────────────────────────────────────
function computeScores() {
  const dims = { presentation: 0, careSystem: 0, stewardship: 0 };
  let total = 0;
  state.scored.forEach((choice, i) => {
    const pts = choice === null ? 0 : SCORED[i].opts[choice][1];
    total += pts;
    dims[SCORED[i].dim] += pts;
  });
  // Lowest dimension by percentage of its max
  let lowest = "presentation", lowestRatio = Infinity;
  for (const key of Object.keys(dims)) {
    const ratio = dims[key] / DIMS[key].max;
    if (ratio < lowestRatio) { lowestRatio = ratio; lowest = key; }
  }
  return { total, pct: Math.round(total / MAX_POINTS * 100), dims, lowest };
}

// ── Finish + submit ───────────────────────────────────────
function finish() {
  track("assessment_completed");
  state.step = "result";
  save();

  const { total, pct, dims, lowest } = computeScores();
  const profile = PROFILES.find(p => total >= p.min);

  fetch("/api/assessment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: state.firstName,
      email: state.email,
      role: state.role,
      desiredOutcome: state.outcome,
      obstacles: state.obstacles,
      obstacleOther: state.obstacleOther,
      serviceTiming: state.timing,
      answers: state.scored.map((c, i) => ({ q: i + 1, choice: c, points: c === null ? 0 : SCORED[i].opts[c][1] })),
      totalPoints: total,
      percentage: pct,
      dimensionScores: dims,
      resultProfile: profile.name,
      lowestDimension: DIMS[lowest].label,
      utm
    })
  }).catch(() => { /* result still shows; lead capture is best-effort client-side */ });

  render();
}

function renderResult() {
  show("result");
  track("assessment_result_viewed");
  const { total, pct, dims, lowest } = computeScores();
  const profile = PROFILES.find(p => total >= p.min);

  el("scorePct").textContent = pct;
  el("scorePoints").textContent = total + " of " + MAX_POINTS + " points";
  el("profileName").textContent = profile.name;
  el("profileMeaning").textContent = profile.meaning;

  const rows = el("dimRows");
  rows.innerHTML = "";
  for (const key of Object.keys(DIMS)) {
    const d = DIMS[key];
    const row = document.createElement("div");
    row.className = "quiz-dim" + (key === lowest ? " lowest" : "");
    row.innerHTML =
      '<div class="quiz-dim-head"><span>' + d.label + "</span><span>" + dims[key] + " / " + d.max + "</span></div>" +
      '<div class="quiz-dim-bar"><span style="width:' + Math.round(dims[key] / d.max * 100) + '%"></span></div>' +
      (key === lowest ? '<p class="quiz-dim-tag">First priority</p>' : "");
    rows.appendChild(row);
  }

  el("dimReco").textContent = DIM_RECO[lowest];
  el("outcomeReco").textContent = state.outcome ? OUTCOME_RECO[state.outcome] : "";

  const list = el("stepList");
  list.innerHTML = "";
  profile.steps.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

el("stripeCta").addEventListener("click", () => track("assessment_stripe_clicked"));
el("protocolCta").addEventListener("click", () => {
  track("assessment_protocol_clicked");
  el("protocolNote").hidden = false;
  el("protocolCta").disabled = true;
});

render();
