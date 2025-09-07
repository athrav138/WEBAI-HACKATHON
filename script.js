let tasks = [];
let chart, weeklyChart, calendar;

/* Navigation */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");

  document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active"));
  document.querySelector(`.sidebar li[onclick="showPage('${pageId}')"]`).classList.add("active");

  if (pageId === "calendar") initCalendar();
  if (pageId === "dashboard") updateDashboard();
}

/* Add Task */
function addTask() {
  const text = document.getElementById("taskText").value;
  const priority = document.getElementById("taskPriority").value;
  if (!text) return;

  tasks.push({ text, priority, done: false, date: new Date().toISOString().split("T")[0] });
  document.getElementById("taskText").value = "";
  renderTasks();
  updateDashboard();
}

/* Render Tasks */
function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    const li = document.createElement("li");

    if (t.priority === "High") li.classList.add("high");
    if (t.priority === "Medium") li.classList.add("medium");
    if (t.priority === "Low") li.classList.add("low");

    if (t.done) li.classList.add("done");

    li.innerHTML = `
      ${t.text} (${t.priority})
      <button onclick="toggleTask(${i})">${t.done ? "Undo" : "Done"}</button>
    `;
    list.appendChild(li);
  });
}

/* Toggle Task Done */
function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  renderTasks();
  updateDashboard();
}

/* Update Dashboard */
function updateDashboard() {
  const completed = tasks.filter(t => t.done).length;
  const pending = tasks.length - completed;

  document.getElementById("completed").textContent = completed;
  document.getElementById("pending").textContent = pending;

  updateChart(completed, pending);
  updateWeeklyChart();
}

/* Progress Chart */
function updateChart(completed, pending) {
  const ctx = document.getElementById("progressChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "Pending"],
      datasets: [{
        data: [completed, pending],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });

  document.getElementById("progressText").innerText = `${completed} of ${completed + pending} tasks done`;
}

/* Weekly Chart */
function updateWeeklyChart() {
  const ctx = document.getElementById("weeklyChart").getContext("2d");
  if (weeklyChart) weeklyChart.destroy();

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const data = days.map(() => Math.floor(Math.random() * 100)); // mock data

  weeklyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Completion %",
        data: data,
        backgroundColor: "#2563eb"
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

/* Calendar */
function initCalendar() {
  const calendarEl = document.getElementById("calendarView");

  if (calendar) {
    calendar.destroy(); // FIX: prevent duplicate calendar
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 600,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
    events: generateCalendarEvents()
  });

  calendar.render();
}

/* Calendar Events with Colors */
function generateCalendarEvents() {
  const dates = [...new Set(tasks.map(t => t.date))];
  return dates.map(date => {
    const dayTasks = tasks.filter(t => t.date === date);
    const completed = dayTasks.filter(t => t.done).length;
    const percent = (completed / dayTasks.length) * 100;

    let color = "#ef4444"; // red
    if (percent >= 100) color = "#22c55e";
    else if (percent >= 50) color = "#facc15";

    return { title: `${percent.toFixed(0)}% complete`, start: date, color };
  });
}

/* AI Suggestions */
function generateSuggestions() {
  const list = document.getElementById("suggestions");
  list.innerHTML = "";

  if (!tasks.length) {
    list.innerHTML = "<li>Add tasks first!</li>";
    return;
  }

  const order = { High: 1, Medium: 2, Low: 3 };
  const sorted = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);

  let currentTime = 9; // start at 9 AM
  sorted.forEach(t => {
    let duration = t.priority === "High" ? 2 : t.priority === "Medium" ? 1 : 0.5;
    let start = `${currentTime}:00`;
    currentTime += duration;
    let end = `${currentTime}:00`;

    const li = document.createElement("li");
    li.textContent = `${start} - ${end} → ${t.text} (${t.priority})`;
    list.appendChild(li);
  });
}
