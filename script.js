let currentTaskIndex = null;
let timerInterval = null;
let startTime = null;
let viewMode = showDashboard;

function toggleLoginForm(forceShow = null) {
  const form = document.getElementById("login-form");
  form.style.display = 
    forceShow === true ? "block" :
    forceShow === false ? "none" :
    form.style.display === "none" ? "block" : "none";
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  let errorMessage = '';

  if (!gmailPattern.test(email)) errorMessage += "Please enter a valid Gmail address. ";
  if (password.length < 8) errorMessage += "Password must be at least 8 characters long. ";

  if (errorMessage) return alert(errorMessage);

  localStorage.setItem("user", JSON.stringify({ email }));
  document.getElementById("login-form").style.display = "none";
  document.getElementById("login-btn").innerText = "Logout";
  document.getElementById("login-btn").onclick = logout;
  document.getElementById("add-task-nav").style.display = "block";
  loadTasks();
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("currentTaskIndex");
  location.reload();
}

function showDashboard() {
  viewMode = "dashboard";
  displaySections("summary");
  loadTasks();
}

function showAddTask() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login first to add a task.");
    toggleLoginForm(true);
    return;
  }
  viewMode = "addTask";
  displaySections("add-task");
  loadTasks();
}

function showTasks() {
  viewMode = "tasks";
  displaySections("tasks");
  loadTasks();
}

// function displaySections(activeSection) {
//   const sections = {
//     "add-task": "add-task-section",
//     "tasks": "tasks-section",
//     "summary": "summary-section",
//     "user": "user-tasks-section"
//   };

//   for (const key in sections) {
//     const sectionId = sections[key];
//     document.getElementById(sectionId).style.display = (key === activeSection) ? "block" : "none";
//   }
// }

function displaySections(sectionName) {
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("user-tasks-section").style.display = "none";

  switch (sectionName) {
    case "summary":
      document.getElementById("summary-section").style.display = "block";
      break;
    case "add-task":
      document.getElementById("add-task-section").style.display = "block";
      break;
    case "tasks":
      document.getElementById("tasks-section").style.display = "block";
      break;
    case "user":
      document.getElementById("user-tasks-section").style.display = "block";
      break;
    case "daily":
      document.getElementById("tasks-section").style.display = "block";  
      break;
  }
}



function addTask() {
  const name = document.getElementById("task-name").value.trim();
  const desc = document.getElementById("task-description").value.trim();
  if (!name || !desc) return alert("Enter both task name and description.");

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.email) return alert("User not logged in.");

  const today = new Date().toISOString().split("T")[0];

  tasks.push({
    name,
    description: desc,
    created: today,
    email: user.email,
    startTime: null,
    endTime: null,
    totalSeconds: 0,
    sessions: []
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.getElementById("task-name").value = '';
  document.getElementById("task-description").value = '';
  loadTasks();
}



function editCurrentTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const newName = prompt("Edit Task Name", tasks[index].name);
  const newDesc = prompt("Edit Description", tasks[index].description);

  if (newName && newDesc) {
    tasks[index].name = newName;
    tasks[index].description = newDesc;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
  }
}

function deleteTask(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();
}



function showIndividualTotal(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  const seconds = calculateDuration(task);
  const displayEl = document.getElementById(`total-display-${index}`);
  if (displayEl) displayEl.innerText = `Total Time: ${formatTime(seconds)}`;
}


function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = '';

  const totalSeconds = tasks.reduce((sum, task) => sum + calculateDuration(task), 0);
  document.getElementById("total-time").innerText = `Total Time Tracked Today: ${formatTime(totalSeconds)}`;

  const recentList = document.getElementById("recent-tasks-list");
  recentList.innerHTML = '';
  tasks.slice(-3).reverse().forEach(task => {
    const item = document.createElement("li");
    item.textContent = task.name;
    recentList.appendChild(item);
  });

  if (viewMode === "user") return;

  if (viewMode === "dashboard" && currentTaskIndex !== null && tasks[currentTaskIndex]) {
    const task = tasks[currentTaskIndex];
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.innerHTML = `
      <strong>${task.name}</strong>
      <p><strong>Time:</strong> ${formatTime(calculateDuration(task))}</p>
    `;
    taskContainer.appendChild(taskEl);

  } else if (viewMode === "tasks") {
    if (tasks.length === 0) {
      taskContainer.innerHTML = '<p class="task-space">No tasks available. Add a new task.</p>';
    } else {
      tasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.style.cursor = "pointer";

        let statusText = "";
        let statusColor = "";
        let borderColor = "";

        if (task.completed) {
          statusText = "Task completed ✅ ";
          statusColor = "green";
          borderColor = "green";
        } else if (!task.startTime && task.endTime) {
          statusText = "In progress";
          statusColor = "red";
          borderColor = "red";
        } else {
          statusText = "Pending";
          statusColor = "#1b1fec";
          borderColor = "#1b1fec";
        }

        taskEl.style.borderLeft = `5px solid ${borderColor}`;
        taskEl.innerHTML = `
          <p class="task-status" style="font-weight: bold; color: ${statusColor}; margin-bottom: 5px;">
            ${statusText}
          </p>
          <strong>${task.name}</strong>
          <p class="space">${task.description}</p>
          <p><strong>Time:</strong> <span id="timer-display-${index}">${formatTime(calculateDuration(task))}</span></p>
          <div class="tasks" style="margin-top: 10px">
            ${task.completed ? '' : `
              <button id="start-btn-${index}" class="styled-btn" onclick="event.stopPropagation(); startTaskTimer(${index})">
                ${task.sessions && task.sessions.length > 0 ? "Resume" : "Start"}
              </button>
              <button id="stop-btn-${index}" class="styled-btn" onclick="event.stopPropagation(); stopTaskTimer(${index})">Stop</button>
              <button class="styled-btn" onclick="event.stopPropagation(); editCurrentTask(${index})">Edit</button>
            `}
            <button class="styled-btn" onclick="event.stopPropagation(); deleteTask(${index})">Delete</button>
            <button class="styled-btn" onclick="event.stopPropagation(); taskCompleted(${index})">
              ${task.completed ? 'Reset to In Progress' : 'Mark as Completed'}
            </button>
          </div>
        `;

        taskEl.addEventListener('click', () => {
          changeStartToResume(index);
        });

        taskContainer.appendChild(taskEl);
      });
    }
  }
}


function taskCompleted(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];

  if (task.completed) {
    task.completed = false;
    task.startTime = null;           
    task.endTime = null;
  } else {
    task.completed = true;
    task.endTime = new Date().toISOString();
    task.startTime = null;
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();
}



function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  if (!task) return;

  let totalSeconds = task.totalSeconds || 0;
  if (task.startTime) {
    const runningSeconds = Math.floor((new Date() - new Date(task.startTime)) / 1000);
    totalSeconds += runningSeconds;
  }

  const displayEl = document.getElementById(`timer-display-${index}`);
  if (displayEl) {
    displayEl.innerText = formatTime(totalSeconds);
  }
}


function toggleSubmenu() {
  const dailyTasks = document.getElementById("daily-tasks");
  const userTasks = document.getElementById("userTasks");
  const arrow = document.getElementById("arrow");

  const isVisible = dailyTasks.style.display === "block";
  dailyTasks.style.display = isVisible ? "none" : "block";
  userTasks.style.display = isVisible ? "none" : "block";
  arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
}

function showDailyTasks() {
  viewMode = "tasks";
  displaySections("daily");

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date().toISOString().split("T")[0];
  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = '';

  const dailyTasks = tasks.map((task, i) => ({ ...task, originalIndex: i })).filter(task => task.created === today);

  if (dailyTasks.length === 0) {
    taskContainer.innerHTML = '<p class="task-space">No daily tasks for today.</p>';
  } else {
    dailyTasks.forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
        <strong>${task.name}</strong>
        <p class="space">${task.description}</p>
        <p><strong>Time:</strong> ${formatTime(calculateDuration(task))}</p>
        <div class="tasks" style="margin-bottom: 10px">
          <button class="styled-btn" onclick="showIndividualTotal(${task.originalIndex})">Total</button>
        </div>
        <p id="total-display-${task.originalIndex}" style="font-weight: bold; color: #333;"></p>
      `;
      taskContainer.appendChild(taskEl);
    });
  }
}


function onTaskClick(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const task = tasks[index];
  const startButton = document.getElementById(`start-btn-${index}`);

  if (task && !task.startTime && task.endTime) {
    startButton.innerText = "Resume";
  }
}

window.onload = function() {
  const user = JSON.parse(localStorage.getItem("user"));
  const loginBtn = document.getElementById("login-btn");

  if (user && user.email) {
    loginBtn.innerText = "Logout";
    loginBtn.onclick = logout;
    document.getElementById("add-task-nav").style.display = "block";
  } else {
    loginBtn.innerText = "Login";
    loginBtn.onclick = () => toggleLoginForm();
    document.getElementById("add-task-nav").style.display = "none";
  }

  showDashboard();
  loadTasks();
};

function startTaskTimer(index) {
  if (timerInterval) clearInterval(timerInterval);

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  const startButton = document.getElementById(`start-btn-${index}`);
  const now = new Date();

  if (!task.sessions) task.sessions = [];

  task.startTime = now.toISOString();
  task.sessions.push({ start: now.toISOString(), end: null });

  if (task.sessions.length === 1) {
    startButton.innerText = "Start";
  } else {
    startButton.innerText = "Resume";
  }

  currentTaskIndex = index;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateTimerDisplay(index);

  timerInterval = setInterval(() => {
    updateTimerDisplay(index);
  }, 1000);
}


function stopTaskTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (currentTaskIndex === null) return;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[currentTaskIndex];
  const now = new Date();

  const currentSession = task.sessions[task.sessions.length - 1];
  if (currentSession && !currentSession.end) {
    currentSession.end = now.toISOString();

    const durationSec = Math.floor((new Date(currentSession.end) - new Date(currentSession.start)) / 1000);
    task.totalSeconds = (task.totalSeconds || 0) + durationSec;
  }

  task.startTime = null;
  task.endTime = now.toISOString();

  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();

  currentTaskIndex = null;
}




function calculateDuration(task) {
  
  return task.totalSeconds || 0;
}

function showUser() {
  viewMode = "user";
  displaySections("user");

  const user = JSON.parse(localStorage.getItem("user"));
  const userTaskList = document.getElementById("user-tasks-list");
  userTaskList.innerHTML = '';

  if (user && user.email) {
    const userEl = document.createElement("div");
    userEl.className = "task";
    userEl.innerHTML = `<strong>User</strong><p>Email: ${user.email}</p>`;
    userTaskList.appendChild(userEl);

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const userTasks = tasks.filter(task => task.email === user.email);

    userTasks.forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";

      const sessions = task.sessions || [];
      let totalSeconds = 0;
      let html = `
        <hr>
        <strong>Task:</strong> ${task.name}<br>
        <strong>Description:</strong> ${task.description || "No description"}<br>
      `;

      if (sessions.length > 0) {
        
        const calculateDuration = (start, stop) => {
          if (start && stop) {
            return Math.floor((stop - start) / 1000);
          }
          return 0;
        };

        const first = sessions[0];
        const start = first.start ? new Date(first.start) : null;
        const stop = first.end ? new Date(first.end) : null;
        let mainDuration = calculateDuration(start, stop);
        totalSeconds += mainDuration;

        html += `
          <br><strong>Start:</strong> ${start ? start.toLocaleString() : "N/A"}
          <br><strong>Stop:</strong> ${stop ? stop.toLocaleString() : "Running..."}
          <br><strong>Duration:</strong> ${stop ? formatTime(mainDuration) : "Running..."}
        `;

        sessions.slice(1).forEach((resume, i) => {
          const resumeStart = resume.start ? new Date(resume.start) : null;
          const resumeStop = resume.end ? new Date(resume.end) : null;
          let resumeDuration = calculateDuration(resumeStart, resumeStop);
          totalSeconds += resumeDuration;

          html += `
            <br><br><strong>Resume ${i + 1}</strong>
            <br><strong>Resume Start:</strong> ${resumeStart ? resumeStart.toLocaleString() : "N/A"}
            <br><strong>Resume Stop:</strong> ${resumeStop ? resumeStop.toLocaleString() : "Running..."}
            <br><strong>Resume Duration:</strong> ${resumeStop ? formatTime(resumeDuration) : "Running..."}
          `;
        });
      }

      html += `<br><br><strong>Total Duration:</strong> ${formatTime(totalSeconds)}`;

      taskEl.innerHTML = html;
      userTaskList.appendChild(taskEl);
    });

    
  }
}

function changeStartToResume(index) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];

  
  if (task && task.startTime === null && task.endTime !== null) {
    const startButton = document.getElementById(`start-btn-${index}`);
    
  
    if (startButton) {
      startButton.innerText = "Resume";
    }
  }
}


// function hideAllSections() {
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "none";
//   document.getElementById("user-tasks-section").style.display = "none";
//   const dailySection = document.getElementById("daily-tasks-section");
//   if (dailySection) dailySection.style.display = "none"; // in case it exists
// }


// this is my code in this when  i click the showTasks and then click the showUser the showUser will open in the showTasks page same like it happen when i clik the  showDailyTasks and then showUser

