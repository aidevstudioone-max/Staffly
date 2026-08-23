const EMPLOYEES_KEY = "teamloom_employees";
const ATTENDANCE_KEY = "teamloom_attendance";
const LEAVE_KEY = "teamloom_leave_requests";
const PAYROLL_KEY = "teamloom_payroll";

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
function formatCurrency(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function getCurrentMonthKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}
function currentMonthLabel() {
  return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
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
function loadPayroll() {
  return JSON.parse(localStorage.getItem(PAYROLL_KEY) || "{}");
}
function savePayroll(obj) {
  localStorage.setItem(PAYROLL_KEY, JSON.stringify(obj));
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

// ---------- Payroll ----------
const ROLE_SALARY = {
  "Senior Engineer": 95000, "Sales Executive": 42000, "Product Designer": 68000,
  "Backend Engineer": 88000, "Sales Manager": 72000, "Operations Lead": 65000,
  "UX Designer": 60000, "Frontend Engineer": 80000, "Operations Associate": 38000,
};
const BANK_NAMES = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"];
const UPI_PROVIDERS = ["okhdfcbank", "okaxis", "oksbi", "okicici"];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}
function ensureSalaries(employees) {
  let changed = false;
  employees.forEach((e) => {
    if (!e.salary) {
      e.salary = ROLE_SALARY[e.role] || 50000;
      changed = true;
    }
  });
  if (changed) saveEmployees(employees);
  return employees;
}
function bankNameForEmployee(emp) {
  return BANK_NAMES[hashStr(emp.id) % BANK_NAMES.length];
}
function maskedAccountForEmployee(emp) {
  const digits = String(1000 + (hashStr(emp.id + "acct") % 9000));
  return "•••• •••• " + digits;
}
function ifscForEmployee(emp) {
  const bank = bankNameForEmployee(emp);
  const prefix = bank.split(" ")[0].slice(0, 4).toUpperCase();
  return prefix + "0" + String(100000 + (hashStr(emp.id + "ifsc") % 899999));
}
function upiForEmployee(emp) {
  const handle = emp.name.toLowerCase().replace(/[^a-z]/g, ".");
  return handle + (hashStr(emp.id + "upi") % 99) + "@" + UPI_PROVIDERS[hashStr(emp.id) % UPI_PROVIDERS.length];
}
function generateUtr() {
  return "UTR" + Date.now().toString().slice(-9) + Math.floor(10 + Math.random() * 90);
}

// Standard Indian payslip structure: Basic 50% of gross, HRA 40% of Basic,
// remainder as Special Allowance so earnings always sum back to gross.
// PF is 12% of Basic, capped at the statutory PF wage ceiling (₹15,000).
function computeSalaryBreakdown(gross) {
  const basic = Math.round(gross * 0.5);
  const hra = Math.round(basic * 0.4);
  const special = gross - basic - hra;
  const pfWage = Math.min(basic, 15000);
  const pf = Math.round(pfWage * 0.12);
  const professionalTax = gross > 15000 ? 200 : 0;
  const grossEarnings = basic + hra + special;
  const totalDeductions = pf + professionalTax;
  const netPay = grossEarnings - totalDeductions;
  return { basic, hra, special, grossEarnings, pf, professionalTax, totalDeductions, netPay };
}

function renderPayroll() {
  const employees = ensureSalaries(loadEmployees());
  const monthKey = getCurrentMonthKey();
  const payroll = loadPayroll();
  const paidMap = payroll[monthKey] || {};

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const paidAmount = employees.reduce((s, e) => s + (paidMap[e.id] ? e.salary : 0), 0);
  const pendingCount = employees.filter((e) => !paidMap[e.id]).length;

  document.getElementById("payrollMonthLabel").textContent = currentMonthLabel();
  document.getElementById("payrollStats").innerHTML = `
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-cash"/></svg> Total Payroll</div><div class="stat-value">${formatCurrency(totalPayroll)}</div></div>
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-check"/></svg> Paid This Month</div><div class="stat-value">${formatCurrency(paidAmount)}</div></div>
    <div class="stat-card"><div class="stat-label"><svg class="icon"><use href="#icon-calendar"/></svg> Pending Payouts</div><div class="stat-value">${pendingCount}</div></div>`;

  const table = document.getElementById("payrollTable");
  table.innerHTML = `
    <thead><tr><th>Employee</th><th>Department</th><th>Monthly Salary</th><th>Status</th><th></th></tr></thead>
    <tbody>${employees
      .map((e) => {
        const rec = paidMap[e.id];
        return `<tr>
          <td><div class="emp-cell"><span class="avatar" style="background:${avatarColor(e.name)}; width:28px; height:28px; font-size:.68rem">${initials(e.name)}</span> ${e.name}</div></td>
          <td>${e.department}</td>
          <td>${formatCurrency(e.salary)}</td>
          <td><span class="status-pill ${rec ? "active" : "on_leave"}">${rec ? "Paid" : "Pending"}</span></td>
          <td>${rec ? `<div class="payroll-paid-cell"><span class="payroll-utr">${rec.utr}</span><button class="btn btn-outline btn-sm" data-payslip="${e.id}">View Payslip</button></div>` : `<button class="btn btn-primary btn-sm" data-payout="${e.id}">Pay Now</button>`}</td>
        </tr>`;
      })
      .join("")}</tbody>`;

  table.querySelectorAll("[data-payout]").forEach((btn) =>
    btn.addEventListener("click", () => openPayoutModal(btn.dataset.payout))
  );
  table.querySelectorAll("[data-payslip]").forEach((btn) =>
    btn.addEventListener("click", () => openPayslipModal(btn.dataset.payslip, monthKey))
  );
}

function closePayrollModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function openPayoutModal(empId) {
  const employees = ensureSalaries(loadEmployees());
  const emp = employees.find((e) => e.id === empId);
  const bank = bankNameForEmployee(emp);
  const acct = maskedAccountForEmployee(emp);
  const ifsc = ifscForEmployee(emp);
  const upi = upiForEmployee(emp);

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-head">
      <h3>Process Payout</h3>
      <button class="modal-close" id="modalCloseBtn"><svg class="icon"><use href="#icon-x"/></svg></button>
    </div>
    <div class="modal-summary">
      <div class="row"><span>Employee</span><span>${emp.name}</span></div>
      <div class="row"><span>Department</span><span>${emp.department}</span></div>
      <div class="row total"><span>Net salary</span><span>${formatCurrency(emp.salary)}</span></div>
    </div>
    <div class="pay-methods" id="payMethods">
      <button type="button" class="pay-method-tab active" data-method="bank"><svg class="icon"><use href="#icon-bank"/></svg> Bank Transfer</button>
      <button type="button" class="pay-method-tab" data-method="upi"><svg class="icon"><use href="#icon-cash"/></svg> UPI</button>
    </div>
    <div class="pay-panel active" data-panel="bank">
      <div class="payout-account-card">
        <div class="row"><span>Bank</span><span>${bank}</span></div>
        <div class="row"><span>Account</span><span>${acct}</span></div>
        <div class="row"><span>IFSC</span><span>${ifsc}</span></div>
        <div class="row"><span>Beneficiary</span><span>${emp.name}</span></div>
      </div>
    </div>
    <div class="pay-panel" data-panel="upi">
      <div class="payout-account-card">
        <div class="row"><span>UPI ID</span><span>${upi}</span></div>
        <div class="row"><span>Beneficiary</span><span>${emp.name}</span></div>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="payoutCancelBtn">Cancel</button>
      <button type="button" class="btn btn-primary btn-block pay-btn-pay" id="payoutBtn">
        <span class="pay-btn-label">Authorize ${formatCurrency(emp.salary)}</span>
        <span class="spinner"><span class="spinner-ring"></span></span>
      </button>
    </div>
    <div class="pay-trust"><svg class="icon"><use href="#icon-lock"/></svg> Bank-grade encryption · Processed by TeamloomPay</div>`;

  document.getElementById("modalCloseBtn").addEventListener("click", closePayrollModal);
  document.getElementById("payoutCancelBtn").addEventListener("click", closePayrollModal);

  let activeMethod = "bank";
  document.querySelectorAll(".pay-method-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeMethod = tab.dataset.method;
      document.querySelectorAll(".pay-method-tab").forEach((t) => t.classList.toggle("active", t === tab));
      document.querySelectorAll(".pay-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === activeMethod));
    });
  });

  document.getElementById("payoutBtn").addEventListener("click", () => {
    const btn = document.getElementById("payoutBtn");
    btn.classList.add("loading");
    btn.disabled = true;
    document.getElementById("payoutCancelBtn").disabled = true;
    const paymentDetail =
      activeMethod === "bank" ? { method: "Bank Transfer", display: `${bank} ${acct}` } : { method: "UPI", display: upi };
    setTimeout(() => completePayout(emp, paymentDetail), 1500);
  });

  document.getElementById("modalOverlay").classList.add("open");
}

function completePayout(emp, paymentDetail) {
  const monthKey = getCurrentMonthKey();
  const payroll = loadPayroll();
  if (!payroll[monthKey]) payroll[monthKey] = {};
  const utr = generateUtr();
  payroll[monthKey][emp.id] = {
    paid: true,
    method: paymentDetail.method,
    display: paymentDetail.display,
    utr,
    amount: emp.salary,
    paidAt: new Date().toISOString(),
    breakdown: computeSalaryBreakdown(emp.salary),
  };
  savePayroll(payroll);

  document.getElementById("modalBody").innerHTML = `
    <div class="confirm-view">
      <div class="confirm-icon"><svg class="icon"><use href="#icon-check"/></svg></div>
      <h3>Payout complete</h3>
      <p>${formatCurrency(emp.salary)} has been sent to ${emp.name} via ${paymentDetail.method}.</p>
      <div class="pay-receipt">
        <div class="row"><span>Reference (UTR)</span><span>${utr}</span></div>
        <div class="row"><span>Paid to</span><span>${paymentDetail.display}</span></div>
        <div class="row"><span>Amount</span><span>${formatCurrency(emp.salary)}</span></div>
        <div class="row muted"><span>Status</span><span style="color:var(--green); font-weight:700;">Paid</span></div>
      </div>
      <button class="btn btn-primary btn-block" id="modalDoneBtn">Done</button>
    </div>`;
  document.getElementById("modalDoneBtn").addEventListener("click", closePayrollModal);

  showToast(`Payout sent to ${emp.name}`);
  renderPayroll();
}

function openBulkPayoutModal() {
  const employees = ensureSalaries(loadEmployees());
  const monthKey = getCurrentMonthKey();
  const payroll = loadPayroll();
  const paidMap = payroll[monthKey] || {};
  const pending = employees.filter((e) => !paidMap[e.id]);
  if (!pending.length) {
    showToast("Everyone has already been paid this month");
    return;
  }
  const total = pending.reduce((s, e) => s + e.salary, 0);

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-head">
      <h3>Batch Payout</h3>
      <button class="modal-close" id="modalCloseBtn"><svg class="icon"><use href="#icon-x"/></svg></button>
    </div>
    <div class="modal-summary">
      <div class="row"><span>Employees</span><span>${pending.length} pending</span></div>
      <div class="row total"><span>Total payout</span><span>${formatCurrency(total)}</span></div>
    </div>
    <p class="pay-hint">Salaries will be transferred to each employee's bank account on file via TeamloomPay.</p>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="bulkCancelBtn">Cancel</button>
      <button type="button" class="btn btn-primary btn-block pay-btn-pay" id="bulkPayBtn">
        <span class="pay-btn-label">Authorize ${formatCurrency(total)}</span>
        <span class="spinner"><span class="spinner-ring"></span></span>
      </button>
    </div>
    <div class="pay-trust"><svg class="icon"><use href="#icon-lock"/></svg> Bank-grade encryption · Processed by TeamloomPay</div>`;

  document.getElementById("modalCloseBtn").addEventListener("click", closePayrollModal);
  document.getElementById("bulkCancelBtn").addEventListener("click", closePayrollModal);
  document.getElementById("bulkPayBtn").addEventListener("click", () => {
    const btn = document.getElementById("bulkPayBtn");
    btn.classList.add("loading");
    btn.disabled = true;
    document.getElementById("bulkCancelBtn").disabled = true;
    setTimeout(() => {
      const payroll2 = loadPayroll();
      if (!payroll2[monthKey]) payroll2[monthKey] = {};
      pending.forEach((emp) => {
        payroll2[monthKey][emp.id] = {
          paid: true,
          method: "Bank Transfer",
          display: `${bankNameForEmployee(emp)} ${maskedAccountForEmployee(emp)}`,
          utr: generateUtr(),
          amount: emp.salary,
          paidAt: new Date().toISOString(),
          breakdown: computeSalaryBreakdown(emp.salary),
        };
      });
      savePayroll(payroll2);

      document.getElementById("modalBody").innerHTML = `
        <div class="confirm-view">
          <div class="confirm-icon"><svg class="icon"><use href="#icon-check"/></svg></div>
          <h3>Payroll processed</h3>
          <p>${formatCurrency(total)} sent to ${pending.length} employee${pending.length > 1 ? "s" : ""}.</p>
          <button class="btn btn-primary btn-block" id="modalDoneBtn">Done</button>
        </div>`;
      document.getElementById("modalDoneBtn").addEventListener("click", closePayrollModal);
      showToast(`Payroll processed for ${pending.length} employee(s)`);
      renderPayroll();
    }, 1800);
  });

  document.getElementById("modalOverlay").classList.add("open");
}

function openPayslipModal(empId, monthKey) {
  const employees = loadEmployees();
  const emp = employees.find((e) => e.id === empId);
  const payroll = loadPayroll();
  const rec = payroll[monthKey] && payroll[monthKey][empId];
  if (!emp || !rec) return;
  const b = rec.breakdown || computeSalaryBreakdown(rec.amount);
  const paidOnLabel = new Date(rec.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  document.getElementById("modalBody").innerHTML = `
    <div class="modal-head">
      <h3>Payslip</h3>
      <button class="modal-close" id="modalCloseBtn"><svg class="icon"><use href="#icon-x"/></svg></button>
    </div>
    <div class="payslip">
      <div class="payslip-head">
        <div><strong>${emp.name}</strong><br><span class="muted">${emp.role} · ${emp.department}</span></div>
        <div class="payslip-period">${currentMonthLabel()}</div>
      </div>
      <div class="payslip-cols">
        <div>
          <h4>Earnings</h4>
          <div class="payslip-row"><span>Basic</span><span>${formatCurrency(b.basic)}</span></div>
          <div class="payslip-row"><span>HRA</span><span>${formatCurrency(b.hra)}</span></div>
          <div class="payslip-row"><span>Special Allowance</span><span>${formatCurrency(b.special)}</span></div>
          <div class="payslip-row total"><span>Gross Earnings</span><span>${formatCurrency(b.grossEarnings)}</span></div>
        </div>
        <div>
          <h4>Deductions</h4>
          <div class="payslip-row"><span>Provident Fund</span><span>${formatCurrency(b.pf)}</span></div>
          <div class="payslip-row"><span>Professional Tax</span><span>${formatCurrency(b.professionalTax)}</span></div>
          <div class="payslip-row total"><span>Total Deductions</span><span>${formatCurrency(b.totalDeductions)}</span></div>
        </div>
      </div>
      <div class="payslip-netpay"><span>Net Pay</span><span>${formatCurrency(b.netPay)}</span></div>
      <div class="payslip-meta">
        <div class="payslip-row"><span>Paid via</span><span>${rec.method} (${rec.display})</span></div>
        <div class="payslip-row"><span>Reference (UTR)</span><span>${rec.utr}</span></div>
        <div class="payslip-row"><span>Paid on</span><span>${paidOnLabel}</span></div>
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="payslipCloseBtn">Close</button>
      <button type="button" class="btn btn-primary btn-block" id="payslipPrintBtn">Print Payslip</button>
    </div>`;

  document.getElementById("modalCloseBtn").addEventListener("click", closePayrollModal);
  document.getElementById("payslipCloseBtn").addEventListener("click", closePayrollModal);
  document.getElementById("payslipPrintBtn").addEventListener("click", () => printPayslip(emp, rec, b, paidOnLabel));

  document.getElementById("modalOverlay").classList.add("open");
}

function printPayslip(emp, rec, b, paidOnLabel) {
  const w = window.open("", "_blank", "height=650,width=480");
  if (!w) {
    showToast("Print popup was blocked by the browser.");
    return;
  }
  const row = (label, val, cls) => `<div class="row${cls ? " " + cls : ""}"><span>${label}</span><span>${val}</span></div>`;
  w.document.write(`<html><head><title>Payslip - ${emp.name}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;padding:30px;color:#1B2130;max-width:420px;margin:0 auto;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
    h2{margin:0 0 2px;font-size:1.15rem;}
    .muted{color:#5A6274;font-size:.85rem;margin:0;}
    .period{font-weight:700;font-size:.9rem;}
    h4{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:#5A6274;margin:20px 0 8px;border-bottom:1px solid #E1E4EE;padding-bottom:6px;}
    .row{display:flex;justify-content:space-between;padding:4px 0;font-size:.92rem;}
    .row.total{font-weight:700;border-top:1px dashed #E1E4EE;margin-top:4px;padding-top:8px;}
    .netpay{display:flex;justify-content:space-between;background:#EEF0FA;border-radius:8px;padding:14px 16px;margin-top:20px;font-weight:800;font-size:1.05rem;}
    .meta{margin-top:20px;border-top:1px solid #E1E4EE;padding-top:12px;}
    .meta .row{font-size:.82rem;color:#5A6274;}
  </style></head><body>
    <div class="top">
      <div><h2>${emp.name}</h2><p class="muted">${emp.role} &middot; ${emp.department} &middot; ${emp.id}</p></div>
      <div class="period">${currentMonthLabel()}</div>
    </div>
    <h4>Earnings</h4>
    ${row("Basic", formatCurrency(b.basic))}
    ${row("HRA", formatCurrency(b.hra))}
    ${row("Special Allowance", formatCurrency(b.special))}
    ${row("Gross Earnings", formatCurrency(b.grossEarnings), "total")}
    <h4>Deductions</h4>
    ${row("Provident Fund", formatCurrency(b.pf))}
    ${row("Professional Tax", formatCurrency(b.professionalTax))}
    ${row("Total Deductions", formatCurrency(b.totalDeductions), "total")}
    <div class="netpay"><span>Net Pay</span><span>${formatCurrency(b.netPay)}</span></div>
    <div class="meta">
      ${row("Paid via", `${rec.method} (${rec.display})`)}
      ${row("Reference (UTR)", rec.utr)}
      ${row("Paid on", paidOnLabel)}
    </div>
    <p style="text-align:center;color:#8A8F9C;font-size:.7rem;margin-top:24px;">This is a computer-generated payslip and does not require a signature.</p>
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
    w.close();
  }, 400);
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
  document.getElementById("bulkPayoutBtn").addEventListener("click", openBulkPayoutModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closePayrollModal();
  });

  const today = todayISO();
  document.getElementById("leaveStart").min = today;
  document.getElementById("leaveEnd").min = today;

  renderDirectory();
  populateLeaveEmployeeSelect();
  renderAttendanceGrid();
  renderLeaveRequests();
  renderDashboard();
  renderPayroll();
});
