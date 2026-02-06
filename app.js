document.querySelector("#year").textContent = new Date().getFullYear();

const form = document.querySelector("#bookingForm");
const resetBtn = document.querySelector("#resetBtn");
const statusEl = document.querySelector("#formStatus");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.textContent = "";
});

resetBtn.addEventListener("click", () => {
  form.reset();
  statusEl.textContent = "";
});
