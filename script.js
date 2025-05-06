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

function displaySections(sectionName) {
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("user-tasks-section").style.display = "none";
  document.getElementById("status-section").style.display = "none"

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
      case "status":
        document.getElementById("status-section").style.display = "block";
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

  const today = new Date().toISOString().split("T")[0];  // "YYYY-MM-DD" format

  const newTask = {
    name,
    description: desc,
    created: today,
    email: user.email,
    startTime: null,
    endTime: null,
    totalSeconds: 0,
    sessions: []
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  
  console.log('Task Added:', newTask);
  console.log('Updated Task List:', tasks);

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
  
  document.getElementById('status-chart-container').innerHTML = '<canvas id="status-chart"></canvas>';
renderStatusChart();

}


function showIndividualTotal(task) {
  const seconds = calculateDuration(task);
  const taskId = task.id || task.name;
  const displayEl = document.getElementById(`total-display-${taskId}`);
  if (displayEl) {
    displayEl.innerText = `Total Time: ${formatTime(seconds)}`;
  } else {
    console.error("Missing display element for:", taskId);
  }
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
    updateRunningTask(tasks)
    const task = tasks[currentTaskIndex];
    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.innerHTML = `
      <strong>${task.name}</strong>
      <p><strong>Time:</strong> ${formatTime(calculateDuration(task))}</p>
    `;
    taskContainer.appendChild(taskEl);
  }else if (viewMode === "tasks") {
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
          <p><strong>Time ⏱ :</strong> <span id="timer-display-${index}">${formatTime(calculateDuration(task))}</span></p>
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

function toggleSubmenu() {
  const dailyTasks = document.getElementById("daily-tasks");
  const userTasks = document.getElementById("userTasks");
  const status = document.getElementById("status")
  const arrow = document.getElementById("arrow");

  const isVisible = dailyTasks.style.display === "block";
  dailyTasks.style.display = isVisible ? "none" : "block";
  userTasks.style.display = isVisible ? "none" : "block";
  status.style.display = isVisible ? "none" : "block";
  arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
}

function showDailyTasks() {
  viewMode = "tasks";
  displaySections("daily");

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date().toISOString().split("T")[0];  
  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = ''; 

  console.log('All Tasks from LocalStorage:', tasks);
  console.log('Today\'s Date:', today);

  const dailyTasks = tasks.filter(task => {
    console.log('Comparing:', task.created, 'with', today);
    return task.created === today;
  });

  console.log('Filtered Daily Tasks:', dailyTasks);

  if (dailyTasks.length === 0) {
    taskContainer.innerHTML = '<p class="task-space">No daily tasks for today.</p>';
  } else {
    dailyTasks.forEach(task => {
      const taskId = task.id || task.name; 
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
        <strong>${task.name}</strong>
        <p class="space">${task.description}</p>
        <div class="tasks" style="margin-bottom: 10px">
          <button class="styled-btn" onclick='showIndividualTotal(${JSON.stringify(task)})'>Total</button>
        </div>
        <p id="total-display-${taskId}" style="font-weight: bold; color: #333;"></p>
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
    updateRunningTask(tasks); 
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
  updateRunningTask(); 


  currentTaskIndex = null;
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



function calculateDuration(task) {
  let duration = task.totalSeconds || 0;

  if (!task.isCompleted && task.startTime) {
    const now = new Date();
    const start = new Date(task.startTime);
    const runningSeconds = Math.floor((now - start) / 1000);
    duration += runningSeconds;
  }

  return duration;
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

    userTasks.forEach((task, index) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";

      const sessions = task.sessions || [];
      let totalSeconds = 0;

      const calculateDuration = (start, stop) => {
        if (start && stop) {
          return Math.floor((stop - start) / 1000);
        }
        return 0;
      };

      let html = `
        <hr>
        <strong>Task:</strong> ${task.name}<br>
        <div class="arrow">
          <i class="fa-solid fa-chevron-down" style="cursor: pointer; " onclick="toggleResumeSection(${index})"></i>
        </div>
        <strong>Description:</strong> ${task.description || "No description"}<br>
      `;

      if (sessions.length > 0) {
        const first = sessions[0];
        const start = first.start ? new Date(first.start) : null;
        const stop = first.end ? new Date(first.end) : null;
        let mainDuration = calculateDuration(start, stop);
        totalSeconds += mainDuration;

        html += `
          <br><strong>Start:</strong> ${start ? start.toLocaleString() : "N/A"}
          <br><strong>Stop:</strong> ${stop ? stop.toLocaleString() : "Running..."}
          <br><strong>Duration:</strong> ${stop ? formatTime(mainDuration) : "Running..."}
          <br>
          
          <div id="resume-section-${index}" style="display: none; margin-top: 10px;">
        `;

        sessions.slice(1).forEach((resume, i) => {
          const resumeStart = resume.start ? new Date(resume.start) : null;
          const resumeStop = resume.end ? new Date(resume.end) : null;
          let resumeDuration = calculateDuration(resumeStart, resumeStop);
          totalSeconds += resumeDuration;

          html += `
            <div>
              <strong>Resume ${i + 1}</strong><br>
              <strong>Resume Start:</strong> ${resumeStart ? resumeStart.toLocaleString() : "N/A"}<br>
              <strong>Resume Stop:</strong> ${resumeStop ? resumeStop.toLocaleString() : "Running..."}<br>
              <strong>Resume Duration:</strong> ${resumeStop ? formatTime(resumeDuration) : "Running..."}<br>
            </div><br>
          `;
        });

        html += `</div>`;
      }

      html += `<br><strong>Total Duration:</strong> ${formatTime(totalSeconds)}`;

      taskEl.innerHTML = html;
      userTaskList.appendChild(taskEl);
    });
  }
}

function toggleResumeSection(index) {
  const section = document.getElementById(`resume-section-${index}`);
  if (section) {
    section.style.display = section.style.display === "none" ? "block" : "none";
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



function updateRunningTask() {

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  if (!Array.isArray(tasks)) {
    console.error("Tasks is not an array:", tasks);
    return; 
  }

  const runningTask = tasks.find(task => task.startTime && !task.completed);

  const runningTaskDiv = document.getElementById("running-task");

  if (!runningTask) {
    runningTaskDiv.innerHTML = "<p>No task is currently running.</p>";
    return;
  }

  const runningDuration = calculateDuration(runningTask);
  runningTaskDiv.innerHTML = `
    <p style="font-weight: bold; color: green;">Running Task ⏱</p>
    <strong>${runningTask.name}</strong>
    <p>${runningTask.description}</p>
    <p><strong>Time:</strong> <span>${formatTime(runningDuration)}</span></p>
  `;
}

function showStatus() {
  viewMode = "status";
  displaySections("status");
  renderStatusChart(); 
}


let statusChart = null;

function renderStatusChart() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  const today = new Date().toISOString().split('T')[0];

  const todaysTasks = tasks.filter(task => task.created === today && task.totalSeconds > 0);

  console.log("Today's Tasks:", todaysTasks);

  const labels = todaysTasks.map(task => task.name);
  const durations = todaysTasks.map(task => {
    let totalSeconds = task.totalSeconds || 0;

    if (task.startTime) {
      const now = new Date();
      const startTime = new Date(task.startTime);
      totalSeconds += Math.floor((now - startTime) / 1000);
    }

    return totalSeconds / 60; 
  });

  console.log("Task Labels:", labels);
  console.log("Durations:", durations);


  if (labels.length === 0 || durations.length === 0) {
    document.getElementById('status-chart').innerHTML = '<p>No tasks to display for today.</p>';
    return;
  }

  const maxDuration = Math.max(...durations, 360); 

  const ctx = document.getElementById('status-chart').getContext('2d');

  if (statusChart) statusChart.destroy();

  
  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Task Duration (mins)', 
        data: durations,
        backgroundColor: '#1b1fec', 
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Task Duration for Today' },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const minutes = tooltipItem.raw;
              const hours = Math.floor(minutes / 60);
              const mins = Math.floor(minutes % 60);
              return `${hours > 0 ? hours + 'hr ' : ''}${mins > 0 ? mins + 'm' : '0m'}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true,  text: 'Task Name' },
        },
        y: {
          beginAtZero: true,
          max: maxDuration, 
          title: { display: true, text: 'Duration' },
          ticks: {
            stepSize: 60, 
            callback: function(value) {
              const hours = Math.floor(value / 60);
              if (hours > 0) {
                return `${hours}hr`; 
              } else {
                return `${value}m`; 
              }
            }
          }
        }
      }
    }
  });
}


