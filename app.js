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

// Prevent HTML injection in rendered text
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- DOM ----------
$("#year").textContent = new Date().getFullYear();

const form = $("#bookingForm");
const resetBtn = $("#resetBtn");
const statusEl = $("#formStatus");

const requestsList = $("#requestsList");
const requestsEmpty = $("#requestsEmpty");
const searchInput = $("#searchInput");
const clearAllBtn = $("#clearAllBtn");

let searchQuery = "";


// ---------- state ----------
let requests = loadRequests();
renderRequests();

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderRequests();
});

clearAllBtn.addEventListener("click", () => {
  if (!requests.length) return;

  const ok = confirm("Clear all saved requests? This cannot be undone.");
  if (!ok) return;

  requests = [];
  saveRequests(requests);
  renderRequests();
});


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
    contacted: false,
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

  if (d.name.length < 2) {
    setError("name", "Please enter your name (min 2 characters).");
    valid = false;
  }

  if (!isValidEmail(d.email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (!d.style) {
    setError("style", "Please select a style.");
    valid = false;
  }

  if (d.placement.length < 2) {
    setError("placement", "Please enter a placement (e.g. forearm).");
    valid = false;
  }

  if (d.size.length < 1) {
    setError("size", "Please enter an approximate size.");
    valid = false;
  }

  if (!d.date) {
    setError("date", "Please select a preferred date.");
    valid = false;
  }

  if (d.notes.length < 10) {
    setError("notes", "Please describe your idea (min 10 characters).");
    valid = false;
  }

  return valid;
}

// ---------- request actions ----------
function toggleContacted(id) {
  requests = requests.map((r) =>
    r.id === id ? { ...r, contacted: !r.contacted } : r
  );
  saveRequests(requests);
  renderRequests();
}

function deleteRequest(id) {
  const ok = confirm("Delete this request?");
  if (!ok) return;

  requests = requests.filter((r) => r.id !== id);
  saveRequests(requests);
  renderRequests();
}


// ---------- rendering ----------
function renderRequests() {
  requestsList.innerHTML = "";

  let visible = requests;

  if (searchQuery.trim() !== "") {
    visible = requests.filter((r) => {
      const blob = `${r.name} ${r.email} ${r.instagram} ${r.style} ${r.placement} ${r.size} ${r.budget} ${r.date} ${r.notes}`.toLowerCase();
      return blob.includes(searchQuery);
    });
  }

  if (!visible.length) {
    requestsEmpty.style.display = "block";
    return;
  }

  requestsEmpty.style.display = "none";

  for (const r of visible) {
    const li = document.createElement("li");
    li.className = "request-item";
    if (r.contacted) li.classList.add("contacted");

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

    const actions = document.createElement("div");
    actions.className = "req-actions";

    const contactedBtn = document.createElement("button");
    contactedBtn.className = "req-btn";
    contactedBtn.textContent = r.contacted ? "Contacted ✓" : "Mark contacted";
    contactedBtn.addEventListener("click", () => toggleContacted(r.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "req-btn danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteRequest(r.id));

    actions.appendChild(contactedBtn);
    actions.appendChild(deleteBtn);

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
    li.appendChild(actions);
    li.appendChild(details);
    requestsList.appendChild(li);
  }
}
