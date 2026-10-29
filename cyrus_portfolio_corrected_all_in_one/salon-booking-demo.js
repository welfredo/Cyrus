const prices = {
  "Haircut & Styling": 350,
  "Hair Treatment": 650,
  "Manicure": 250,
  "Facial Cleanse": 500
};
const form = document.getElementById("bookingForm");
const serviceSelect = document.getElementById("service");
const dateInput = document.getElementById("date");
const pricePreview = document.getElementById("pricePreview");
const formMessage = document.getElementById("formMessage");
const appointmentList = document.getElementById("appointmentList");
const clearAllButton = document.getElementById("clearAll");
const storageKey = "studioBloomDemoAppointments";

function getAppointments() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function saveAppointments(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}
function updatePrice() {
  const price = prices[serviceSelect.value];
  pricePreview.textContent = price ? `₱${price.toLocaleString("en-PH")}` : "Choose a service";
}
function renderAppointments() {
  const items = getAppointments();
  clearAllButton.hidden = items.length === 0;
  if (!items.length) {
    appointmentList.innerHTML = '<div class="empty-state"><span>✦</span><h3>No appointments yet</h3><p>Once you submit the form, your appointment will appear here.</p></div>';
    return;
  }
  appointmentList.innerHTML = items.map(item => `
    <article class="appointment-card">
      <div>
        <h3>${escapeHTML(item.service)}</h3>
        <p>For ${escapeHTML(item.name)} · ${escapeHTML(item.email)}</p>
        <div class="appointment-meta">
          <span>▦ ${escapeHTML(formatDate(item.date))}</span>
          <span>◷ ${escapeHTML(item.time)}</span>
          <span>✦ ${escapeHTML(item.stylist)}</span>
          <span>₱${Number(item.price).toLocaleString("en-PH")}</span>
        </div>
        ${item.notes ? `<p class="appointment-notes">Notes: ${escapeHTML(item.notes)}</p>` : ""}
      </div>
      <button class="cancel-button" type="button" data-cancel="${item.id}">Cancel request</button>
    </article>`).join("");
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-PH", {year:"numeric", month:"short", day:"numeric"});
}
function setMinimumDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  dateInput.min = localDate;
}
serviceSelect.addEventListener("change", updatePrice);
document.querySelectorAll(".choose-service").forEach(button => {
  button.addEventListener("click", () => {
    serviceSelect.value = button.dataset.service;
    updatePrice();
    document.getElementById("booking").scrollIntoView({behavior:"smooth"});
    serviceSelect.focus({preventScroll:true});
  });
});
form.addEventListener("submit", event => {
  event.preventDefault();
  const price = prices[serviceSelect.value];
  if (!price) {
    formMessage.textContent = "Please choose a service before saving your appointment.";
    return;
  }
  const data = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    service: serviceSelect.value,
    stylist: document.getElementById("stylist").value,
    date: dateInput.value,
    time: document.getElementById("time").value,
    notes: document.getElementById("notes").value.trim(),
    price,
    createdAt: new Date().toISOString()
  };
  const items = getAppointments();
  items.unshift(data);
  saveAppointments(items);
  renderAppointments();
  form.reset();
  updatePrice();
  formMessage.textContent = "Demo appointment saved! Your request now appears under My Appointments.";
  document.getElementById("appointments").scrollIntoView({behavior:"smooth"});
});
appointmentList.addEventListener("click", event => {
  const button = event.target.closest("[data-cancel]");
  if (!button) return;
  saveAppointments(getAppointments().filter(item => item.id !== button.dataset.cancel));
  renderAppointments();
});
clearAllButton.addEventListener("click", () => {
  if (confirm("Clear all saved demo appointments from this browser?")) {
    saveAppointments([]);
    renderAppointments();
  }
});
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));
setMinimumDate();
updatePrice();
renderAppointments();
