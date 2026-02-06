// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);

function setError(fieldName, message) {
  const el = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) el.textContent = message || "";
}

function clearAllErrors() {
  document.querySelectorAll(".error").forEach((e) => (e.textContent = ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function saveRequests(arr) {
  localStorage.setItem("bookingRequests", JSON.stringify(arr));
}

function loadRequests() {
  const raw = localStorage.getItem("bookingRequests");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ---------- DOM ----------
$("#year").textContent = new Date().getFullYear();

const form = $("#bookingForm");
const resetBtn = $("#resetBtn");
const statusEl = $("#formStatus");

const requestsList = $("#requestsList");
const requestsEmpty = $("#requestsEmpty");

// ---------- state ----------
let requests = loadRequests();
renderRequests();

// ---------- events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";

  clearAllErrors();

  const data = getFormData();
  const ok = validate(data);

  if (!ok) {
    statusEl.textContent = "Please fix the highlighted fields.";
    return;
  }

  const newRequest = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data,
  };

  requests.unshift(newRequest); // newest first
  saveRequests(requests);
  renderRequests();

  form.reset();
  statusEl.textContent = "✅ Request saved! (Stored locally in your browser)";
});

resetBtn.addEventListener("click", () => {
  form.reset();
  statusEl.textContent = "";
  clearAllErrors();
});

// ---------- form logic ----------
function getFormData() {
  return {
    name: $("#name").value.trim(),
    email: $("#email").value.trim(),
    instagram: $("#instagram").value.trim(),
    style: $("#style").value,
    placement: $("#placement").value.trim(),
    size: $("#size").value.trim(),
    budget: $("#budget").value.trim(),
    date: $("#date").value,
    notes: $("#notes").value.trim(),
  };
}

function validate(d) {
  let valid = true;

  // Required: name
  if (d.name.length < 2) {
    setError("name", "Please enter your name (min 2 characters).");
    valid = false;
  }

  // Required: email
  if (!isValidEmail(d.email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }

  // Required: style
  if (!d.style) {
    setError("style", "Please select a style.");
    valid = false;
  }

  // Required: placement
  if (d.placement.length < 2) {
    setError("placement", "Please enter a placement (e.g. forearm).");
    valid = false;
  }

  // Required: size
  if (d.size.length < 1) {
    setError("size", "Please enter an approximate size.");
    valid = false;
  }

  // Required: date
  if (!d.date) {
    setError("date", "Please select a preferred date.");
    valid = false;
  }

  // Required: notes
  if (d.notes.length < 10) {
    setError("notes", "Please describe your idea (min 10 characters).");
    valid = false;
  }

  return valid;
}

// ---------- rendering ----------
function renderRequests() {
  requestsList.innerHTML = "";

  if (!requests.length) {
    requestsEmpty.style.display = "block";
    return;
  }

  requestsEmpty.style.display = "none";

  for (const r of requests) {
    const li = document.createElement("li");
    li.className = "request-item";

    const top = document.createElement("div");
    top.className = "top";

    const left = document.createElement("div");
    left.innerHTML = `
      <strong>${escapeHtml(r.name)}</strong><br />
      <span class="tag">${escapeHtml(r.style)}</span>
      <span class="tag">${escapeHtml(r.date)}</span>
    `;

    const right = document.createElement("div");
    right.innerHTML = `
      <span class="tag">${escapeHtml(r.placement)}</span>
      <span class="tag">${escapeHtml(r.size)}</span>
    `;

    top.appendChild(left);
    top.appendChild(right);

    const details = document.createElement("div");
    details.style.marginTop = "10px";
    details.style.color = "#cbbcff";
    details.style.fontSize = "13px";
    details.innerHTML = `
      <div><strong>Email:</strong> ${escapeHtml(r.email)}</div>
      ${r.instagram ? `<div><strong>IG:</strong> ${escapeHtml(r.instagram)}</div>` : ""}
      ${r.budget ? `<div><strong>Budget:</strong> ${escapeHtml(r.budget)}</div>` : ""}
      <div style="margin-top:8px;"><strong>Notes:</strong> ${escapeHtml(r.notes)}</div>
    `;

    li.appendChild(top);
    li.appendChild(details);
    requestsList.appendChild(li);
  }
}

// Prevent HTML injection in rendered text
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
