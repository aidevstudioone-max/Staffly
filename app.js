const EMPLOYEES_KEY = "staffly_employees";
const ATTENDANCE_KEY = "staffly_attendance";
const LEAVE_KEY = "staffly_leave_requests";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const AVATAR_COLORS = ["#4F46E5", "#0EA5A0", "#E0A030", "#DC4C4C", "#8B5CF6", "#059669", "#DB2777", "#2563EB"];
const STATUS_CYCLE = { P: "A", A: "L", L: "P" };

let currentDeptFilter = "All";

// ---------- Date helpers ----------
// Builds YYYY-MM-DD from local date fields (not toISOString, which converts
// to UTC and shifts the date back a day in any timezone ahead of UTC).
function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function todayISO() {
  return isoDate(new Date());
}
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  return addDays(d, diff);
}
function getWeekStartISO(date) {
  return isoDate(getWeekStart(date));
}
function getDayKey(date) {
  const idx = new Date(date).getDay(); // 0=Sun..6=Sat
  return DAY_KEYS[(idx + 6) % 7]; // shift so 0=mon..6=sun
}
function dayKeyToDate(weekStartISO, dayKey) {
  const offset = DAY_KEYS.indexOf(dayKey);
  return isoDate(addDays(new Date(weekStartISO + "T00:00:00"), offset));
}
function formatDateRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  const s = new Date(start + "T00:00:00").toLocaleDateString("en-IN", opts);
  const e = new Date(end + "T00:00:00").toLocaleDateString("en-IN", opts);
  return start === end ? s : `${s} – ${e}`;
}

// ---------- localStorage ----------
function loadEmployees() {
  return JSON.parse(localStorage.getItem(EMPLOYEES_KEY) || "[]");
}
function saveEmployees(list) {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(list));
}
function loadAttendance() {
  return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || "{}");
}
function saveAttendance(obj) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(obj));
}
function loadLeaveRequests() {
  return JSON.parse(localStorage.getItem(LEAVE_KEY) || "[]");
}
function saveLeaveRequests(list) {
  localStorage.setItem(LEAVE_KEY, JSON.stringify(list));
}

// ---------- Seeding ----------
function seedEmployeesIfEmpty() {
  if (localStorage.getItem(EMPLOYEES_KEY) !== null) return;
  const T = new Date();
  const seed = [
    { name: "Aditi Kulkarni", role: "Senior Engineer", department: "Engineering", email: "aditi.kulkarni@example.com" },
    { name: "Rohan Sharma", role: "Sales Executive", department: "Sales", email: "rohan.sharma@example.com" },
    { name: "Meera Joshi", role: "Product Designer", department: "Design", email: "meera.joshi@example.com" },
    { name: "Karthik Reddy", role: "Backend Engineer", department: "Engineering", email: "karthik.reddy@example.com" },
    { name: "Simran Kaur", role: "Sales Manager", department: "Sales", email: "simran.kaur@example.com" },
    { name: "Devansh Patel", role: "Operations Lead", department: "Operations", email: "devansh.patel@example.com" },
    { name: "Ananya Iyer", role: "UX Designer", department: "Design", email: "ananya.iyer@example.com" },
    { name: "Vikram Nair", role: "Frontend Engineer", department: "Engineering", email: "vikram.nair@example.com" },
    { name: "Pooja Menon", role: "Operations Associate", department: "Operations", email: "pooja.menon@example.com" },
    { name: "Arjun Malhotra", role: "Sales Executive", department: "Sales", email: "arjun.malhotra@example.com" },
  ].map((e, i) => ({ id: "EMP-" + (100 + i), joinDate: isoDate(addDays(T, -200 + i * 11)), ...e }));
  saveEmployees(seed);
}

function seedAttendanceForCurrentWeekIfEmpty(employees) {
  const weekKey = getWeekStartISO(new Date());
  const attendance = loadAttendance();
  if (attendance[weekKey]) return;

  const week = {};
  employees.forEach((emp) => {
    const days = {};
    DAY_KEYS.forEach((dk) => {
      if (dk === "sat" || dk === "sun") {
        days[dk] = "-";
        return;
      }
      const r = Math.random();
      days[dk] = r < 0.8 ? "P" : r < 0.92 ? "L" : "A";
    });
    week[emp.id] = days;
  });
  attendance[weekKey] = week;
  saveAttendance(attendance);
}

function seedLeaveRequestsIfEmpty(employees) {
  if (localStorage.getItem(LEAVE_KEY) !== null) return;
  const T = new Date();
  const byIdx = (i) => employees[i].id;
  const seed = [
    { employeeId: byIdx(2), startDate: todayISO(), endDate: isoDate(addDays(T, 1)), reason: "Family function", status: "approved" },
    { employeeId: byIdx(6), startDate: isoDate(addDays(T, 2)), endDate: isoDate(addDays(T, 2)), reason: "Doctor's appointment", status: "approved" },
    { employeeId: byIdx(5), startDate: isoDate(addDays(T, 5)), endDate: isoDate(addDays(T, 6)), reason: "Personal travel", status: "pending" },
    { employeeId: byIdx(8), startDate: isoDate(addDays(T, 10)), endDate: isoDate(addDays(T, 11)), reason: "Wedding", status: "pending" },
    { employeeId: byIdx(1), startDate: isoDate(addDays(T, -8)), endDate: isoDate(addDays(T, -7)), reason: "Sick leave", status: "rejected" },
  ].map((r, i) => ({ id: "LV-" + (300 + i), requestedAt: isoDate(addDays(T, -5 + i)), ...r }));
  saveLeaveRequests(seed);

  // Sync already-approved seeded leave onto this week's attendance grid.
  seed.filter((r) => r.status === "approved").forEach(applyLeaveToAttendance);
}

// ---------- Avatar helpers ----------
function initials(name) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ---------- Directory ----------
function renderDeptFilters(employees) {
  const depts = ["All", ...new Set(employees.map((e) => e.department))];
  const wrap = document.getElementById("deptFilters");
  wrap.innerHTML = depts
    .map((d) => `<button class="filter-pill ${d === currentDeptFilter ? "active" : ""}" data-dept="${d}">${d}</button>`)
    .join("");
  wrap.querySelectorAll(".filter-pill").forEach((btn) =>
    btn.addEventListener("click", () => {
      currentDeptFilter = btn.dataset.dept;
      renderDirectory();
    })
  );
}

function isEmployeeOnLeaveToday(empId) {
  const weekKey = getWeekStartISO(new Date());
  const attendance = loadAttendance();
  const todayKey = getDayKey(new Date());
  const cell = attendance[weekKey] && attendance[weekKey][empId] ? attendance[weekKey][empId][todayKey] : null;
  return cell === "L";
}

function renderDirectory() {
  const employees = loadEmployees();
  renderDeptFilters(employees);
  const filtered = currentDeptFilter === "All" ? employees : employees.filter((e) => e.department === currentDeptFilter);
  const grid = document.getElementById("employeeGrid");

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">No employees in this department yet.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((e) => {
      const onLeave = isEmployeeOnLeaveToday(e.id);
      return `
      <div class="employee-card">
        <div class="employee-top">
          <span class="avatar" style="background:${avatarColor(e.name)}">${initials(e.name)}</span>
          <div>
            <div class="employee-name">${e.name}</div>
            <div class="employee-role">${e.role}</div>
          </div>
        </div>
        <div class="employee-meta">
          <span class="dept-pill">${e.department}</span>
          <span class="status-pill ${onLeave ? "on_leave" : "active"}">${onLeave ? "On Leave" : "Active"}</span>
        </div>
      </div>`;
    })
    .join("");
}

function openAddForm() {
  document.getElementById("addForm").classList.add("open");
}
function closeAddForm() {
  document.getElementById("addForm").classList.remove("open");
  document.getElementById("employeeForm").reset();
}
function handleAddEmployeeSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("empName").value.trim();
  const role = document.getElementById("empRole").value.trim();
  const department = document.getElementById("empDept").value;
  const email = document.getElementById("empEmail").value.trim();
  if (!name || !role || !/^\S+@\S+\.\S+$/.test(email)) {
    showToast("Please fill in all fields with a valid email");
    return;
  }
  const employees = loadEmployees();
  const id = "EMP-" + (100 + employees.length + Math.floor(Math.random() * 900));
  employees.push({ id, name, role, department, email, joinDate: todayISO() });
  saveEmployees(employees);
  closeAddForm();
  currentDeptFilter = "All";
  renderDirectory();
  populateLeaveEmployeeSelect();
  renderDashboard();
  showToast(`${name} added to the directory`);
}

// ---------- Attendance ----------
function renderAttendanceGrid() {
  const employees = loadEmployees();
  const weekStart = getWeekStartISO(new Date());
  seedAttendanceForCurrentWeekIfEmpty(employees);
  const attendance = loadAttendance();
  const week = attendance[weekStart];

  document.getElementById("attWeekLabel").textContent =
    `Week of ${formatDateRange(weekStart, dayKeyToDate(weekStart, "sun"))}. Click a pill to cycle Present → Absent → Leave.`;

  const header = `<tr><th>Employee</th>${DAY_KEYS.map((dk) => `<th class="day-col">${DAY_LABELS[dk]}</th>`).join("")}</tr>`;
  const rows = employees
    .map((emp) => {
      const days = week[emp.id] || {};
      const cells = DAY_KEYS.map((dk) => {
        const val = days[dk] || "-";
        if (val === "-") return `<td class="att-cell"><span class="att-pill dash">–</span></td>`;
        return `<td class="att-cell"><button class="att-pill ${val}" data-emp="${emp.id}" data-day="${dk}">${val}</button></td>`;
      }).join("");
      return `<tr><td><div class="emp-cell"><span class="avatar" style="background:${avatarColor(emp.name)}; width:28px; height:28px; font-size:.68rem">${initials(emp.name)}</span> ${emp.name}</div></td>${cells}</tr>`;
    })
    .join("");

  document.getElementById("attendanceTable").innerHTML = `<thead>${header}</thead><tbody>${rows}</tbody>`;
  document.querySelectorAll(".att-pill:not(.dash)").forEach((btn) =>
    btn.addEventListener("click", () => cycleAttendanceStatus(btn.dataset.emp, btn.dataset.day))
  );
}

function cycleAttendanceStatus(employeeId, dayKey) {
  const weekStart = getWeekStartISO(new Date());
  const attendance = loadAttendance();
  const current = attendance[weekStart][employeeId][dayKey];
  attendance[weekStart][employeeId][dayKey] = STATUS_CYCLE[current] || "P";
  saveAttendance(attendance);
  renderAttendanceGrid();
  renderDirectory();
  renderDashboard();
}

// ---------- Leave requests ----------
function populateLeaveEmployeeSelect() {
  const select = document.getElementById("leaveEmp");
  const employees = loadEmployees();
  select.innerHTML = employees.map((e) => `<option value="${e.id}">${e.name}</option>`).join("");
}

function applyLeaveToAttendance(request) {
  const weekStart = getWeekStartISO(new Date());
  const weekEnd = dayKeyToDate(weekStart, "sun");
  if (request.endDate < weekStart || request.startDate > weekEnd) return; // outside current week
  const attendance = loadAttendance();
  if (!attendance[weekStart] || !attendance[weekStart][request.employeeId]) return;
  DAY_KEYS.forEach((dk) => {
    if (dk === "sat" || dk === "sun") return;
    const d = dayKeyToDate(weekStart, dk);
    if (d >= request.startDate && d <= request.endDate) {
      attendance[weekStart][request.employeeId][dk] = "L";
    }
  });
  saveAttendance(attendance);
}

function renderLeaveList(targetEl, requests, employees, compact) {
  if (!requests.length) {
    targetEl.innerHTML = `<div class="empty-state">No leave requests${compact ? " pending" : ""}.</div>`;
    return;
  }
  targetEl.innerHTML = requests
    .map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const actions =
        !compact && r.status === "pending"
          ? `<div class="leave-actions">
               <button class="btn btn-outline btn-sm" data-reject="${r.id}">Reject</button>
               <button class="btn btn-primary btn-sm" data-approve="${r.id}">Approve</button>
             </div>`
          : "";
      return `
      <div class="leave-card">
        <div class="leave-card-top">
          <span class="emp-name">${emp ? emp.name : r.employeeId}</span>
          <span class="leave-status ${r.status}">${r.status}</span>
        </div>
        <div class="date-range">${formatDateRange(r.startDate, r.endDate)}</div>
        ${compact ? "" : `<div class="reason">${r.reason}</div>`}
        ${actions}
      </div>`;
    })
    .join("");
  targetEl.querySelectorAll("[data-approve]").forEach((btn) => btn.addEventListener("click", () => approveLeaveRequest(btn.dataset.approve)));
  targetEl.querySelectorAll("[data-reject]").forEach((btn) => btn.addEventListener("click", () => rejectLeaveRequest(btn.dataset.reject)));
}

function renderLeaveRequests() {
  const requests = [...loadLeaveRequests()].sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
  const employees = loadEmployees();
  renderLeaveList(document.getElementById("leaveList"), requests, employees, false);
}

function handleLeaveRequestSubmit(e) {
  e.preventDefault();
  const employeeId = document.getElementById("leaveEmp").value;
  const startDate = document.getElementById("leaveStart").value;
  const endDate = document.getElementById("leaveEnd").value;
  const reason = document.getElementById("leaveReason").value.trim();
  if (!employeeId || !startDate || !endDate || !reason) {
    showToast("Please fill in all fields");
    return;
  }
  if (endDate < startDate) {
    showToast("End date must be on or after the start date");
    return;
  }
  const requests = loadLeaveRequests();
  const id = "LV-" + (300 + requests.length + Math.floor(Math.random() * 900));
  requests.push({ id, employeeId, startDate, endDate, reason, status: "pending", requestedAt: todayISO() });
  saveLeaveRequests(requests);
  document.getElementById("leaveForm").reset();
  renderLeaveRequests();
  renderDashboard();
  showToast("Leave request submitted");
}

function approveLeaveRequest(id) {
  const requests = loadLeaveRequests();
  const req = requests.find((r) => r.id === id);
  if (!req) return;
  req.status = "approved";
  saveLeaveRequests(requests);
  applyLeaveToAttendance(req);
  renderLeaveRequests();
  renderAttendanceGrid();
  renderDirectory();
  renderDashboard();
  showToast("Leave request approved");
}

function rejectLeaveRequest(id) {
  const requests = loadLeaveRequests();
  const req = requests.find((r) => r.id === id);
  if (!req) return;
  req.status = "rejected";
  saveLeaveRequests(requests);
  renderLeaveRequests();
  renderDashboard();
  showToast("Leave request rejected");
}

// ---------- Dashboard ----------
function computeDashboardStats() {
  const employees = loadEmployees();
  const weekStart = getWeekStartISO(new Date());
  const attendance = loadAttendance();
  const week = attendance[weekStart] || {};
  const todayKey = getDayKey(new Date());

  const presentToday = employees.filter((e) => week[e.id] && week[e.id][todayKey] === "P").length;
  const onLeaveToday = employees.filter((e) => week[e.id] && week[e.id][todayKey] === "L").length;
  const departmentCount = new Set(employees.map((e) => e.department)).size;

  return { totalEmployees: employees.length, presentToday, onLeaveToday, departmentCount };
}

function renderDashboard() {
  const stats = computeDashboardStats();
  document.getElementById("dashStats").innerHTML = `
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-people"/></svg> Total Employees</div><div class="stat-value">${stats.totalEmployees}</div></div>
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-check"/></svg> Present Today</div><div class="stat-value">${stats.presentToday}</div></div>
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-calendar"/></svg> On Leave Today</div><div class="stat-value">${stats.onLeaveToday}</div></div>
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-briefcase"/></svg> Departments</div><div class="stat-value">${stats.departmentCount}</div></div>`;

  const employees = loadEmployees();
  const pending = loadLeaveRequests().filter((r) => r.status === "pending");
  renderLeaveList(document.getElementById("dashLeavePreview"), pending.slice(0, 3), employees, true);
}

// ---------- View switching ----------
function switchView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".app-tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  seedEmployeesIfEmpty();
  const employees = loadEmployees();
  seedAttendanceForCurrentWeekIfEmpty(employees);
  seedLeaveRequestsIfEmpty(employees);

  document.getElementById("appTabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".app-tab");
    if (btn) switchView(btn.dataset.view);
  });
  document.getElementById("toggleAddForm").addEventListener("click", () => {
    const panel = document.getElementById("addForm");
    panel.classList.contains("open") ? closeAddForm() : openAddForm();
  });
  document.getElementById("cancelAddForm").addEventListener("click", closeAddForm);
  document.getElementById("employeeForm").addEventListener("submit", handleAddEmployeeSubmit);
  document.getElementById("leaveForm").addEventListener("submit", handleLeaveRequestSubmit);

  const today = todayISO();
  document.getElementById("leaveStart").min = today;
  document.getElementById("leaveEnd").min = today;

  renderDirectory();
  populateLeaveEmployeeSelect();
  renderAttendanceGrid();
  renderLeaveRequests();
  renderDashboard();
});
