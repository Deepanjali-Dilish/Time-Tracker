let currentTaskIndex = null;
let timerInterval = null;
let startTime = null;
let runningTaskInterval = null;
let viewMode = showDashboard;


function showDashboard() {
  viewMode = "dashboard";
  displaySections("summary");
  loadTasks();
}

function showAddTask() {
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
  document.getElementById("target-section").style.display = "none"
  document.getElementById("user-tasks-section").style.display = "none";
  document.getElementById("settings-section").style.display = "none";
  document.getElementById("graph-container").style.display = "none";
  document.getElementById("week-container").style.display = "none";
 

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
    case "target":
      document.getElementById("target-section").style.display = "block";
      break
    case "user":
      document.getElementById("user-tasks-section").style.display = "block";
      break;
    case "daily":
      document.getElementById("tasks-section").style.display = "block";  
      break;
    case "status":
      document.getElementById("graph-container").style.display = "block";
      break;
    case "week":
      document.getElementById("week-container").style.display = "block";
      break;
    case "settings":
        document.getElementById("settings-section").style.display = "block";  
        break;
    
    
  }
}


function addTask() {
  const name = document.getElementById("task-name").value.trim();
  const desc = document.getElementById("task-description").value.trim();
  if (!name || !desc) return alert("Enter the details.");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return alert("User not logged in.");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const userTasks = allTasks[user.email] || [];

  const isDuplicate = userTasks.some(task => task.name.toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    return alert("Task name already exists. Choose a different name.");
  }

  const today = new Date().toISOString().split("T")[0];

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

  userTasks.push(newTask);
  allTasks[user.email] = userTasks;
  localStorage.setItem("userTasks", JSON.stringify(allTasks));

  console.log('Task Added:', newTask);
  console.log('Updated Task List for', user.email, userTasks);

  document.getElementById("task-name").value = '';
  document.getElementById("task-description").value = '';

  loadTasks(); 
}

function editCurrentTask(index) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return alert("User not logged in.");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const userTasks = allTasks[user.email] || [];

  const currentTask = userTasks[index];
  if (!currentTask) return alert("Task not found.");

  const newName = prompt("Edit Task Name", currentTask.name);
  const newDesc = prompt("Edit Description", currentTask.description);

  if (newName && newDesc) {
    currentTask.name = newName;
    currentTask.description = newDesc;

    allTasks[user.email] = userTasks;
    localStorage.setItem("userTasks", JSON.stringify(allTasks));
    loadTasks();
  }
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
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  const allTargets = JSON.parse(localStorage.getItem("targetTasks")) || {};
  const userTargets = allTargets[user.email] || [];

  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = '';

  const totalSecond = tasks.reduce((sum, task) => sum + calculateDuration(task), 0);
  document.getElementById("total-all").innerText = `Total time tracked of all tasks: ${formatTime(totalSecond)}`;

  const today = new Date().toISOString().split("T")[0];
  const startOfToday = new Date(today + "T00:00:00");
  const endOfToday = new Date(today + "T23:59:59.999");

  const totalSeconds = tasks.reduce((sum, task) => {
    const sessions = task.sessions || [];
    return sum + sessions.reduce((taskSum, session) => {
      const start = session.start ? new Date(session.start) : null;
      const stop = session.end ? new Date(session.end) : new Date();

      if (!start) return taskSum;

      const sessionStart = start < startOfToday ? startOfToday : start;
      const sessionEnd = stop > endOfToday ? endOfToday : stop;

      if (sessionEnd > sessionStart) {
        taskSum += Math.floor((sessionEnd - sessionStart) / 1000);
      }

      return taskSum;
    }, 0);
  }, 0);

  document.getElementById("total-time").innerText = `Total Time Tracked Today: ${formatTime(totalSeconds)}`;

  const completedList = document.getElementById("completed-tasks-list");
  completedList.innerHTML = '';

  if (viewMode === "dashboard") {
    const completedTasks = tasks
      .filter(task => task.completed)
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    completedTasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" onclick="scrollToTask('${task.name}')"><strong style="color: black">${task.name}</strong></a> - ${formatTime(calculateDuration(task))}`;
      completedList.appendChild(li);
    });
  }

  const recentList = document.getElementById("recent-tasks-list");
  recentList.innerHTML = '';
  tasks.slice(-3).reverse().forEach(task => {
    const item = document.createElement("li");
    item.innerHTML = `<a href="#" onclick="scrollToTask('${task.name}')"><strong style="color: black">${task.name}</strong></a>`;
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
  } else if (viewMode === "tasks") {
    if (tasks.length === 0) {
      taskContainer.innerHTML = '<p class="task-space">No tasks available. Add a new task.</p>';
    } else {
      tasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.style.cursor = "pointer";

        const target = userTargets.find(t => t.name.toLowerCase() === task.name.toLowerCase());
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
          ${target ? `<p><strong>Target Time  ⏱ :</strong> ${target.targetStr || formatTime(target.targetSeconds)}</p>` : ''}

          <p><strong>Timer ⏱ :</strong> <span id="timer-display-${index}">${formatTime(calculateDuration(task))}</span></p>
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
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return alert("User not logged in.");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const userTasks = allTasks[user.email] || [];

  const task = userTasks[index];
  if (!task) return alert("Task not found.");

  if (task.completed) {
    task.completed = false;
    task.startTime = null;
    task.endTime = null;
  } else {
    task.completed = true;
    task.endTime = new Date().toISOString();
    task.startTime = null;
  }

  allTasks[user.email] = userTasks;
  localStorage.setItem("userTasks", JSON.stringify(allTasks));
  loadTasks();
}


function deleteTask(index) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  tasks.splice(index, 1); 

  allTasks[user.email] = tasks; 

  localStorage.setItem("userTasks", JSON.stringify(allTasks)); 

  loadTasks(); 
}



function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60)
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function toggleSubmenu() {
  
  if (window.innerWidth >= 768) return;

  const dailyTasks = document.getElementById("daily-tasks");
  const userTasks = document.getElementById("userTasks");
  const status = document.getElementById("status");
  const week = document.getElementById("week");
  const settings = document.getElementById("settings");
  const arrow = document.getElementById("arrow");

  const isVisible = dailyTasks.style.display === "block";
  dailyTasks.style.display = isVisible ? "none" : "block";
  userTasks.style.display = isVisible ? "none" : "block";
  status.style.display = isVisible ? "none" : "block";
  week.style.display = isVisible ? "none" : "block";
  settings.style.display = isVisible ? "none" : "block";
  arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
}



function showDailyTasks() {
  viewMode = "tasks";
  displaySections("daily");

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  const today = new Date().toISOString().split("T")[0];  
  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = ''; 

  console.log('All Tasks from LocalStorage:', tasks);
  console.log('Today\'s Date:', today);

  const dailyTasks = tasks.filter(task => {
    if (!task.created) return false;
    return task.created.split('T')[0] === today;
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


function startTaskTimer(index) {
  if (currentTaskIndex !== null) {
    alert("Please stop the current task before starting a new one.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  const task = tasks[index];
  const now = new Date();

  if (!task.sessions) task.sessions = [];

  task.startTime = now.toISOString();
  task.sessions.push({ start: now.toISOString(), end: null });

  currentTaskIndex = index;

  allTasks[user.email] = tasks;
  localStorage.setItem("userTasks", JSON.stringify(allTasks));

  updateTimerDisplay(index);
  updateRunningTask(); 

  timerInterval = setInterval(() => {
    updateTimerDisplay(index);
  }, 1000);

  if (runningTaskInterval) clearInterval(runningTaskInterval);
  runningTaskInterval = setInterval(() => {
    updateRunningTask();
  }, 1000);
}


function stopTaskTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (currentTaskIndex === null) return;

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  const task = tasks[currentTaskIndex];
  const now = new Date();

  const currentSession = task.sessions[task.sessions.length - 1];
  if (currentSession && !currentSession.end) {
    currentSession.end = now.toISOString();

    const durationSec = Math.floor(
      (new Date(currentSession.end) - new Date(currentSession.start)) / 1000
    );
    task.totalSeconds = (task.totalSeconds || 0) + durationSec;
  }

  task.startTime = null;
  task.endTime = now.toISOString();

  allTasks[user.email] = tasks;
  localStorage.setItem("userTasks", JSON.stringify(allTasks));

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (runningTaskInterval) {
    clearInterval(runningTaskInterval);
    runningTaskInterval = null;
  }

  loadTasks();
  updateRunningTask();
  currentTaskIndex = null;

  checkTargetStatus();
}


function updateTimerDisplay(index) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

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

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userTaskList = document.getElementById("user-tasks-list");
  userTaskList.innerHTML = '';

  if (user && user.email) {
    const userEl = document.createElement("div");
    userEl.className = "task";
    userEl.innerHTML = `<strong>User</strong><p>Email: ${user.email}</p>`;
    userTaskList.appendChild(userEl);

    const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
    const userTasks = allTasks[user.email] || [];

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
          <i class="fa-solid fa-chevron-down" style="cursor: pointer;" onclick="toggleResumeSection(${index})"></i>
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
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const runningTaskDiv = document.getElementById("running-task");

  if (!user || !user.email) {
    runningTaskDiv.innerHTML = "<p>No user logged in.</p>";
    return;
  }

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const userTasks = allTasks[user.email] || [];

  const runningTask = userTasks.find(task => task.startTime && !task.completed);

  if (!runningTask) {
    runningTaskDiv.innerHTML = "<p>No task is currently running.</p>";
    return;
  }

  const runningDuration = calculateDuration(runningTask);
  runningTaskDiv.innerHTML = `
    <p class="gap" style="font-weight: bold; color: green;">Running Task ⏱</p>
    <strong class="gap">${runningTask.name}</strong>
    <p class="gap">${runningTask.description}</p>
    <p><strong>Timer ⏱ :</strong> <span>${formatTime(runningDuration)}</span></p>
  `;
}



function forgotPassword() {
  const email = prompt("Please enter your registered email:");

  if (!email) return alert("Email is required!");

  const users = JSON.parse(localStorage.getItem("accounts")) || [];

  const user = users.find(u => u.email === email);

  if (!user) {
    return alert("This email is not registered.");
  }

  const newPassword = prompt("Enter your new password (minimum 8 characters):");

  if (newPassword && newPassword.length >= 8) {
    user.password = newPassword;
    localStorage.setItem("accounts", JSON.stringify(users));

    alert("Your password has been reset successfully. Please log in with your new password.");
  } else {
    alert("Password must be at least 8 characters long.");
  }
}


function showSignup() {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("signup-container").style.display = "block";
}

function showLogin() {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";
}


window.onload = function () {

   
  
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const loginBtn = document.getElementById("login-btn");

  if (user && user.email) {
    if (loginBtn) {
      loginBtn.innerText = "Logout";
      loginBtn.onclick = logout;
    }

    document.getElementById("dashboard-section").style.display = "flex";
    document.querySelector(".top-bar").style.display = "flex";
    document.querySelector("footer").style.display = "flex";
    document.getElementById("login-container").style.display = "none";
    document.getElementById("add-task-nav").style.display = "block";

    loadTasks();
    showDashboard();
  } else {
    document.getElementById("signup-container").style.display = "block"; 
    document.getElementById("login-container").style.display = "none"; 
  }
  
};



function logout() {
  localStorage.removeItem("loggedInUser");

  document.getElementById("dashboard-section").style.display = "none";
  document.querySelector(".top-bar").style.display = "none";
  document.querySelector("footer").style.display = "none";
  document.getElementById("login-container").style.display = "block";
  document.getElementById("add-task-nav").style.display = "none";


  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  if (emailInput) emailInput.value = "";
  if (passwordInput) passwordInput.value = "";

  const signupUser = document.getElementById("signup-username");
  const signupEmail = document.getElementById("signup-email");
  const signupPassword = document.getElementById("signup-password");
  const signupConfrim = document.getElementById("signup-confirm-password");

  if (signupUser) signupUser.value = "";
  if (signupEmail) signupEmail.value = "";
  if (signupPassword) signupPassword.value = "";
  if (signupConfrim) signupConfrim.value = "";

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.innerText = "Login";
    loginBtn.onclick = showLogin;
  }
}

function login() {
  const email = document.getElementById("login-email").value.trim();  
  const password = document.getElementById("login-password").value;  
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  let errorMessage = '';
  if (!gmailPattern.test(email)) errorMessage += "Please enter a valid Gmail address. ";
  if (password.length < 8) errorMessage += "Password must be at least 8 characters long. ";
  if (errorMessage) {
    alert(errorMessage);
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    return;
  }

  const users = JSON.parse(localStorage.getItem("accounts")) || [];

  const user = users.find(u => u.email === email);

  if (!user) {
    alert("Account does not exist.Please sign up");
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    return;
  }

  if (user.password !== password) {
    alert("Incorrect password. Please try again.");
    return;
  }

  const lastLoginKey = `lastLogin_${email}`;
  const isFirstLogin = !localStorage.getItem(lastLoginKey);
  localStorage.setItem(lastLoginKey, new Date().toISOString());

  const welcomeMsg = isFirstLogin
    ? `Welcome, ${user.username || email.split("@")[0]}!`
    : `Welcome back, ${user.username || email.split("@")[0]}!`;
  alert(welcomeMsg);

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  document.getElementById("login-container").style.display = "none";
  document.getElementById("login-btn").innerText = "Logout";
  document.getElementById("login-btn").onclick = logout;
  document.getElementById("add-task-nav").style.display = "block";
  document.querySelector(".top-bar").style.display = "flex";
  document.querySelector("footer").style.display = "flex";
  document.getElementById("dashboard-section").style.display = "flex";

  loadTasks();
}



function signup() {
  const username = document.getElementById("signup-username").value;
  const confirm = document.getElementById("signup-confirm-password").value;

  const email = document.getElementById("signup-email").value.trim();  
  const password = document.getElementById("signup-password").value;  
  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  let errorMessage = '';
  if (!gmailPattern.test(email)) errorMessage += "Please enter a valid Gmail address. ";
  if (password.length < 8) errorMessage += "Password must be at least 8 characters long. ";
  if (errorMessage) return alert(errorMessage);

  if (!username || !email || !password || !confirm) {
    alert("Please fill in all fields.");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];


  const exists = accounts.some(user => user.email === email);
  if (exists) {
    alert("This email is already registered.");
    return;
  }

  accounts.push({ username, email, password });
  localStorage.setItem("accounts", JSON.stringify(accounts));

  alert("Account created successfully! Please login.");
  showLogin();
}



function showSettings() {
  //viewMode = "settings";
  displaySections("settings");
  settings(); 
}


function settings() {
  
  document.querySelectorAll("main > div").forEach(s => s.style.display = "none");

  const settingsSection = document.getElementById("settings-section");
  if (settingsSection) settingsSection.style.display = "block";


  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    alert("No logged in user found.");
    return;
  }

  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");

  if (userNameEl) userNameEl.textContent = `User name: ${loggedInUser.username || "No username"}`;
  if (userEmailEl) userEmailEl.textContent = `Email: ${loggedInUser.email || "No email"}`;
}



function deleteAccount() {
  if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    alert("No user logged in.");
    return;
  }


  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  accounts = accounts.filter(acc => acc.email !== loggedInUser.email);
  localStorage.setItem("accounts", JSON.stringify(accounts));


  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  delete allTasks[loggedInUser.email];
  localStorage.setItem("userTasks", JSON.stringify(allTasks));

  
  localStorage.removeItem(`userTimer_${loggedInUser.email}`);
  localStorage.removeItem(`lastLogin_${loggedInUser.email}`);
  localStorage.removeItem("loggedInUser");

  alert("Your account and all associated data have been deleted.");
  logout(); 
}



function togglePasswordVisibility(form) {
  if (form === 'signup') {
    const password = document.getElementById("signup-password");
    const confirm = document.getElementById("signup-confirm-password");
    const checkbox = document.getElementById("signup-show-password-checkbox");
    if (!password || !confirm || !checkbox) return;
    if (checkbox.checked) {
      password.type = "text";
      confirm.type = "text";
    } else {
      password.type = "password";
      confirm.type = "password";
    }
  } else if (form === 'login') {
    const password = document.getElementById("login-password");
    const checkbox = document.getElementById("login-show-password-checkbox");
    if (!password || !checkbox) return;
    if (checkbox.checked) {
      password.type = "text";
    } else {
      password.type = "password";
    }
  }
}


function showStatus() {
  viewMode = "status";
  displaySections("status");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const tasks = (allTasks && user && allTasks[user.email]) || [];
  createTaskDurationGraph(tasks);
  


}




function createTaskDurationGraph(tasks) {
  const slotDuration = 3600; 
  const defaultHours = 5;

  const today = new Date().toISOString().split("T")[0];
  const startOfToday = new Date(today + "T00:00:00");
  const endOfToday = new Date(today + "T23:59:59.999");

  const todayTasks = tasks.filter(task => {
    const sessions = task.sessions || [];
    return sessions.some(session => {
      if (!session.start) return false;
      const start = new Date(session.start);
      const end = session.end ? new Date(session.end) : new Date();
      return end >= startOfToday && start <= endOfToday;
    });
  });

  const graphContainer = document.getElementById("graph-container");
  if (!graphContainer) return;
  graphContainer.innerHTML = "";
  graphContainer.style.position = "relative"

  const heading = document.createElement("h3");
  heading.textContent = "Today's Task Duration Graph";
  graphContainer.appendChild(heading);

  if (todayTasks.length === 0) {
    graphContainer.innerHTML += `<p class="no-space">No tasks performed today.</p>`;
    return;
  }

  const taskDurations = todayTasks.map(task => {
    const sessions = task.sessions || [];
    let totalSeconds = 0;

    sessions.forEach(session => {
      if (!session.start) return;
      const start = new Date(session.start);
      const end = session.end ? new Date(session.end) : new Date();
      const sessionStart = start < startOfToday ? startOfToday : start;
      const sessionEnd = end > endOfToday ? endOfToday : end;
      if (sessionEnd > sessionStart) {
        totalSeconds += (sessionEnd - sessionStart) / 1000;
      }
    });

    return totalSeconds / slotDuration; 
  });

  const maxDuration = Math.max(...taskDurations, defaultHours);
  const maxY = Math.ceil(maxDuration);
  const maxX = todayTasks.length;

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = `36px 1fr`;
  wrapper.style.width = "100%";
  wrapper.style.alignItems = "stretch";
  wrapper.style.gap = "0";
  wrapper.style.marginTop ="15px"

  
  const yAxis = document.createElement("div");
  yAxis.style.display = "flex";
  yAxis.style.flexDirection = "column";
  yAxis.style.justifyContent = "space-between";
  yAxis.style.height = "100%";
  yAxis.style.boxSizing = "border-box";
  yAxis.style.paddingTop = "2px";

  for (let i = maxY; i >= 0; i--) {
    const label = document.createElement("div");
    label.className = 'hour-space'
    label.textContent = `${i} hr`;
    label.style.height = "0";
    label.style.lineHeight = "0";
    label.style.transform = "translateY(-50%)";
    label.style.position = "relative";
    label.style.top = "0";
    label.style.fontSize = "clamp(10px, 1vw, 14px)";
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.justifyContent = "flex-end";
    yAxis.appendChild(label);
  }
  

  
  const grid = document.createElement("div");
  grid.className = "grid-gap";
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${maxX}, minmax(0, 1fr))`;
  grid.style.gridTemplateRows = `repeat(${maxY}, 1fr)`;
  grid.style.width = "100%";
  grid.style.aspectRatio = `${maxX} / ${maxY}`;
  grid.style.position = "relative";
  grid.style.backgroundColor = "#fff";
  grid.style.borderLeft = "2px solid #ccc";
  grid.style.borderBottom = "2px solid #ccc";
  
  for (let row = 0; row < maxY; row++) {
    for (let col = 0; col < maxX; col++) {
      const cell = document.createElement("div");
      cell.style.border = "1px solid #ccc"; 
      cell.style.boxSizing = "border-box";
      cell.style.position = "relative";
      cell.style.backgroundColor = "#fff";

      const taskDuration = taskDurations[col] || 0;
      const currentHour = maxY - row;
      const lowerBound = currentHour - 1;

      let fillFraction = 0;
      if (taskDuration > lowerBound) {
        fillFraction = Math.min(taskDuration - lowerBound, 1);
        if (fillFraction < 0) fillFraction = 0;
        if (fillFraction > 1) fillFraction = 1;
      }

      if (fillFraction > 0) {
        const fillDiv = document.createElement("div");
        fillDiv.style.position = "absolute";
        fillDiv.style.bottom = "0";
        fillDiv.style.left = "0";
        fillDiv.style.width = "100%";
        fillDiv.style.height = `${fillFraction * 100}%`;
        fillDiv.style.backgroundColor = "#1b1fec"
        fillDiv.style.transition = "height 0.3s ease";
        fillDiv.style.cursor = 'pointer';
        fillDiv.title = formatTime(fillFraction * slotDuration);
        cell.appendChild(fillDiv);

        if (row === maxY - Math.ceil(taskDuration)) {
          const label = document.createElement("div");
          //label.textContent = `${taskDuration.toFixed(2)} hr`;
          label.style.position = "absolute";
          label.style.top = "50%";
          label.style.left = "50%";
          label.style.transform = "translate(-50%, -50%)";
          label.style.color = "black";
          label.style.fontSize = "clamp(10px, 1vw, 12px)";
          label.style.fontWeight = "bold";
          label.style.pointerEvents = "none";
          cell.appendChild(label);
        }
      }

      grid.appendChild(cell);
    }
  }

  wrapper.appendChild(yAxis);
  wrapper.appendChild(grid);

  
  const yUnit = document.createElement("div");
  yUnit.className = "yContent"
  yUnit.textContent = "Duration(hr)";
  yUnit.style.position = "absolute";
  yUnit.style.transform = "rotate(-90deg)";
  yUnit.style.transformOrigin = "left top";
  yUnit.style.textAlign = "center"
  // yUnit.style.left = "-20px";
  // yUnit.style.top = "100px";
  yUnit.style.fontSize = "clamp(10px, 1vw, 14px)";
  graphContainer.appendChild(yUnit);

  graphContainer.appendChild(wrapper);


  const xLabels = document.createElement("div");
  xLabels.className = 'taskx';
  xLabels.style.display = "grid";
  xLabels.style.gridTemplateColumns = `repeat(${maxX}, minmax(0, 1fr))`;
  xLabels.style.marginTop = "5px";
  xLabels.style.marginLeft = "19px";

  todayTasks.forEach(task => {
    const label = document.createElement("div");
    label.textContent = task.name || "Task";
    label.style.textAlign = "center";
    label.style.fontSize = "clamp(10px, 1vw, 14px)";
    label.style.overflow = "hidden";
    label.style.textOverflow = "ellipsis";
    label.style.whiteSpace = "nowrap";
    xLabels.appendChild(label);
  });

  graphContainer.appendChild(xLabels);


  const xUnit = document.createElement("div");
  xUnit.textContent = "Task Name";
  xUnit.style.textAlign = "center";
  xUnit.style.fontSize = "clamp(10px, 1vw, 14px)";
  xUnit.style.marginTop = "15px";
  graphContainer.appendChild(xUnit);
}



function weeklyStatus() {
  viewMode = "week";
  displaySections("week");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const tasks = (allTasks && user && allTasks[user.email]) || [];

  createWeeklyTaskDurationGraph(tasks); 
}


function createWeeklyTaskDurationGraph(tasks) {

  const weekContainer = document.getElementById("week-container");
  if (!weekContainer) return;

  weekContainer.innerHTML = "";
  weekContainer.style.position = "relative";

  const headerWrapper = document.createElement("div");
  headerWrapper.style.display = "flex";
  headerWrapper.style.justifyContent = "space-between";
  headerWrapper.style.alignItems = "center";
  headerWrapper.style.marginBottom = "10px";

  const heading = document.createElement("h3");
  heading.textContent = "This Week's Task Duration Graph";
  heading.style.margin = "0";

  const buttonGroup = document.createElement("div");
  buttonGroup.style.display = "flex";
  buttonGroup.style.border = "1px solid #ccc";
  buttonGroup.style.borderRadius = "5px";
  buttonGroup.style.overflow = "hidden";

  const thisWeekBtn = document.createElement("button");
  thisWeekBtn.className = "this"
  thisWeekBtn.textContent = "This week";
  thisWeekBtn.style.border = "none";
  thisWeekBtn.style.cursor = "pointer";
  thisWeekBtn.style.backgroundColor = "#007bff";
  thisWeekBtn.style.color = "#fff";
  thisWeekBtn.style.fontWeight = "bold";

  const lastWeekBtn = document.createElement("button");
  lastWeekBtn.className = "last"
  lastWeekBtn.textContent = "Last week";
  lastWeekBtn.style.border = "none";
  lastWeekBtn.style.cursor = "pointer";
  lastWeekBtn.style.backgroundColor = "rgb(167 167 196)";
  lastWeekBtn.style.color = "#fff";

  buttonGroup.appendChild(lastWeekBtn);
  buttonGroup.appendChild(thisWeekBtn);
  headerWrapper.appendChild(heading);
  headerWrapper.appendChild(buttonGroup);
  weekContainer.appendChild(headerWrapper);

  function updateGraph(isLastWeek = false) {
    
    [...weekContainer.children].forEach(child => {
      if (child !== headerWrapper) {
        weekContainer.removeChild(child);
      }
    });

    const slotDuration = 3600;
    const defaultHours = 5;
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const now = new Date();
    const currentDay = now.getDay();
    const startOfWeek = new Date(now);

    startOfWeek.setDate(startOfWeek.getDate() - currentDay - (isLastWeek ? 7 : 0));
    startOfWeek.setHours(0, 0, 0, 0);

    const dailyDurations = new Array(7).fill(0);

    tasks.forEach(task => {
      (task.sessions || []).forEach(session => {
        if (!session.start) return;
        const start = new Date(session.start);
        const end = session.end ? new Date(session.end) : new Date();

        for (let d = 0; d < 7; d++) {
          const dayStart = new Date(startOfWeek);
          dayStart.setDate(dayStart.getDate() + d);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const sessionStart = start < dayStart ? dayStart : start;
          const sessionEnd = end > dayEnd ? dayEnd : end;

          if (sessionEnd > sessionStart) {
            dailyDurations[d] += Math.floor((sessionEnd - sessionStart) / 1000);
          }
        }
      });
    });

    const rotatedDurations = dailyDurations.slice(1).concat(dailyDurations[0]);
    const dailyHours = rotatedDurations.map(sec => sec / slotDuration);
    const maxDuration = Math.max(...dailyHours, defaultHours);
    const maxY = Math.ceil(maxDuration);

    const wrapper = document.createElement("div");
    wrapper.id = "graph-wrapper";
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = `36px 1fr`;
    wrapper.style.width = "100%";
    wrapper.style.alignItems = "stretch";
    wrapper.style.gap = "0";
    wrapper.style.marginTop = "15px";

    const yAxis = document.createElement("div");
    yAxis.style.display = "flex";
    yAxis.style.flexDirection = "column";
    yAxis.style.justifyContent = "space-between";
    yAxis.style.height = "100%";
    yAxis.style.boxSizing = "border-box";
    yAxis.style.paddingTop = "2px";

    for (let i = maxY; i >= 0; i--) {
      const label = document.createElement("div");
      label.className = 'hour-space';
      label.textContent = `${i} hr`;
      label.style.height = "0";
      label.style.lineHeight = "0";
      label.style.transform = "translateY(-50%)";
      label.style.position = "relative";
      label.style.top = "0";
      label.style.fontSize = "clamp(10px, 1vw, 14px)";
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.justifyContent = "flex-end";
      yAxis.appendChild(label);
    }

    const grid = document.createElement("div");
    grid.className = "grid-gap";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = `repeat(7, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${maxY}, 1fr)`;
    grid.style.width = "100%";
    grid.style.aspectRatio = `7 / ${maxY}`;
    grid.style.position = "relative";
    grid.style.backgroundColor = "#fff";
    grid.style.borderLeft = "2px solid #ccc";
    grid.style.borderBottom = "2px solid #ccc";

    for (let row = 0; row < maxY; row++) {
      for (let col = 0; col < 7; col++) {
        const cell = document.createElement("div");
        cell.style.border = "1px solid #ccc";
        cell.style.boxSizing = "border-box";
        cell.style.position = "relative";
        cell.style.backgroundColor = "#fff";

        const taskDuration = dailyHours[col] || 0;
        const currentHour = maxY - row;
        const lowerBound = currentHour - 1;

        let fillFraction = 0;
        if (taskDuration > lowerBound) {
          fillFraction = Math.min(taskDuration - lowerBound, 1);
          if (fillFraction < 0) fillFraction = 0;
        }

        if (fillFraction > 0) {
          const fillDiv = document.createElement("div");
          fillDiv.style.position = "absolute";
          fillDiv.style.bottom = "0";
          fillDiv.style.left = "0";
          fillDiv.style.width = "100%";
          fillDiv.style.cursor = "pointer";
          fillDiv.style.height = `max(${fillFraction * 100}%, 3px)`;
          fillDiv.style.backgroundColor = "#1b1fec";
          fillDiv.title = `${daysOfWeek[col]}: ${formatTime(rotatedDurations[col])}`;
          cell.appendChild(fillDiv);
        }

        grid.appendChild(cell);
      }
    }

    wrapper.appendChild(yAxis);
    wrapper.appendChild(grid);

    const yUnit = document.createElement("div");
    yUnit.className = "yContent";
    yUnit.textContent = "Duration (hr)";
    yUnit.style.position = "absolute";
    yUnit.style.transform = "rotate(-90deg)";
    yUnit.style.transformOrigin = "left top";
    yUnit.style.fontSize = "clamp(10px, 1vw, 14px)";
    yUnit.style.textAlign = "center";
    

    weekContainer.appendChild(yUnit);
    weekContainer.appendChild(wrapper);

    const xLabels = document.createElement("div");
    xLabels.style.display = "grid";
    xLabels.style.gridTemplateColumns = `repeat(7, minmax(0, 1fr))`;
    xLabels.style.marginTop = "5px";
    xLabels.style.marginLeft = "19px";

    daysOfWeek.forEach(day => {
      const label = document.createElement("div");
      label.textContent = day;
      label.style.textAlign = "center";
      label.style.fontSize = "clamp(10px, 1vw, 14px)";
      xLabels.appendChild(label);
    });

    weekContainer.appendChild(xLabels);

    const xUnit = document.createElement("div");
    xUnit.textContent = "Day of Week";
    xUnit.style.textAlign = "center";
    xUnit.style.fontSize = "clamp(10px, 1vw, 14px)";
    xUnit.style.marginTop = "15px";
    weekContainer.appendChild(xUnit);

    heading.textContent = isLastWeek
      ? "Last Week's Task Duration Graph"
      : "This Week's Task Duration Graph";
  }

  thisWeekBtn.onclick = () => {
    thisWeekBtn.style.backgroundColor = "#007bff";
    lastWeekBtn.style.backgroundColor = "rgb(167 167 196)";
    updateGraph(false);
  };

  lastWeekBtn.onclick = () => {
    lastWeekBtn.style.backgroundColor = "#007bff";
    thisWeekBtn.style.backgroundColor = "rgb(167 167 196)";
    updateGraph(true);
  };

  updateGraph(); 
}


function showSearchTasks() {
  showSearchBox();

}

function searchTasks() {
  const query = document.getElementById("search-input").value.toLowerCase().trim();

 
  if (!query) {
    document.getElementById("search-results").innerHTML = '';
    return;
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const tasks = allTasks[user.email] || [];

  const resultsList = document.getElementById("search-results");
  resultsList.innerHTML = '';

  const matches = tasks
    .map((task, index) => ({ ...task, index }))
    .filter(task => task.name.toLowerCase().includes(query));

  if (matches.length === 0) {
    resultsList.innerHTML = '<li>No matching tasks found.</li>';
    return;
  }

  matches.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" onclick="scrollToTask(${task.index})"><strong style="color: black">${task.name}</strong></a>`;
    resultsList.appendChild(li);
  });
}



function closeSearchBox() {
  document.getElementById("search-task-container").style.display = "none";
  document.getElementById("search-results").innerHTML = '';
  document.getElementById("search-input").value = '';
}



function createSearchBox() {
  if (document.getElementById("search-task-container")) return;

  const container = document.createElement("div");
  container.id = "search-task-container";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.left = "50%";
  container.style.transform = "translateX(-50%)";
  container.style.background = "white";
  container.style.border = "1px solid #ccc";
  container.style.padding = "15px 20px";
  container.style.borderRadius = "8px";
  container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  container.style.zIndex = "9999";
  container.style.width = "90%";
  container.style.maxWidth = "500px";
  container.style.boxSizing = "border-box";

  const input = document.createElement("input");
  input.type = "text";
  input.id = "search-input";
  input.placeholder = "Enter task name";
  input.style.width = "100%";
  input.style.padding = "8px 12px";
  input.style.fontSize = "16px";
  input.style.borderRadius = "4px";
  input.style.outline = "none";
  input.style.borderColor = "#5a4ff3";
  //input.style.border = "1px solid #ccc";
  input.style.boxSizing = "border-box";

  const searchBtn = document.createElement("button");
  searchBtn.textContent = "Search";
  searchBtn.style.marginTop = "10px";
  searchBtn.style.padding = "8px 15px";
  searchBtn.style.fontSize = "16px";
  searchBtn.style.background = "linear-gradient(90deg, #5A4FF3, #3d8bff)";
  searchBtn.style.border = "none";
  searchBtn.style.color = "white";
  searchBtn.style.borderRadius = "4px";
  searchBtn.style.cursor = "pointer";
  searchBtn.style.fontWeight = "bold"
  searchBtn.onclick = searchTasks;

  searchBtn.addEventListener("mouseover", () => {
    searchBtn.style.backgroundColor = "#0f12b8";
  });
  searchBtn.addEventListener("mouseout", () => {
    searchBtn.style.backgroundColor = "#1b1fec";
  });

  const resultsList = document.createElement("ul");
  resultsList.id = "search-results";
  resultsList.style.listStyle = "none";
  resultsList.style.marginTop = "15px";
  resultsList.style.paddingLeft = "0";
  resultsList.style.maxHeight = "200px";
  resultsList.style.overflowY = "auto";
  resultsList.style.borderTop = "1px solid #eee";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "0px";
  closeBtn.style.right = "9px";
  closeBtn.style.background = "transparent";
  closeBtn.style.border = "none";
  closeBtn.style.fontSize = "22px";
  closeBtn.style.fontWeight = "bold";
  closeBtn.style.color = "#888";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => {
    container.style.display = "none";
    input.value = '';
    resultsList.innerHTML = '';
  };
  
  closeBtn.addEventListener("mouseover", () => {
    closeBtn.style.color = "#444";
  });
  closeBtn.addEventListener("mouseout", () => {
    closeBtn.style.color = "#888";
  });

  container.appendChild(input);
  container.appendChild(searchBtn);
  container.appendChild(resultsList);
  container.appendChild(closeBtn);

  document.body.appendChild(container);
}

function showSearchBox() {
  createSearchBox();
  document.getElementById("search-task-container").style.display = "block";
}

function scrollToTask(identifier) {
  viewMode = "tasks";
  displaySections("tasks");
  loadTasks();

  setTimeout(() => {
    let taskEl = null;

    
    if (!isNaN(identifier)) {
      const innerEl = document.querySelector(`#timer-display-${identifier}`);
      if (innerEl) {
        taskEl = innerEl.closest(".task");
      }
    } else {
    
      const taskElements = document.querySelectorAll(".task");
      for (const el of taskElements) {
        const nameEl = el.querySelector("strong");
        if (nameEl && nameEl.textContent.trim().toLowerCase() === String(identifier).trim().toLowerCase()) {
          taskEl = el; 
          break;
        }
      }
    }

    
    if (taskEl) {
      taskEl.scrollIntoView({ behavior: "smooth", block: "center" });
      taskEl.style.backgroundColor = "#fff176"; 
      setTimeout(() => {
        taskEl.style.backgroundColor = "";
      }, 1500);
    }
  }, 200);
}

function showTarget() {
  displaySections("target")
}

function saveTarget() {
  const name = document.getElementById('target-task-name').value.trim();
  const hours = parseInt(document.getElementById('target-hours').value) || 0;
  const minutes = parseInt(document.getElementById('target-minutes').value) || 0;

  const targetSeconds = (hours * 3600) + (minutes * 60);

  if (!name || isNaN(targetSeconds) || targetSeconds <= 0) {
    return alert('Please fill in task name and valid target time.');
  }

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return alert("User not logged in.");

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const userTasks = allTasks[user.email] || [];

  const task = userTasks.find(task => task.name.toLowerCase() === name.toLowerCase());
  if (!task) {
    return alert("Task not found. Please add the task first.");
  }

  const allTargets = JSON.parse(localStorage.getItem("targetTasks")) || {};
  const userTargets = allTargets[user.email] || [];

  const existingIndex = userTargets.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
  if (existingIndex >= 0) {
    userTargets[existingIndex].targetSeconds = targetSeconds;
  } else {
    userTargets.push({ name, targetSeconds });
  }

  allTargets[user.email] = userTargets;
  localStorage.setItem("targetTasks", JSON.stringify(allTargets));

  alert("Target saved.");

  document.getElementById('target-task-name').value = '';
  document.getElementById('target-hours').value = '';
  document.getElementById('target-minutes').value = '';
  document.getElementById("target-seconds").value = '';

  //document.getElementById('target-section').style.display = 'none';

  loadTasks();
  scrollToTask(name);
}


function checkTargetStatus() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.email) return;

  const allTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
  const allTargets = JSON.parse(localStorage.getItem("targetTasks")) || {};
  const userTasks = allTasks[user.email] || [];
  const userTargets = allTargets[user.email] || [];

  userTasks.forEach(task => {
    const target = userTargets.find(t => t.name.toLowerCase() === task.name.toLowerCase());
    if (target) {
      const actualTime = task.totalSeconds || 0;

      if (actualTime === target.targetSeconds) {
        alert(` Target met for "${task.name}"!`);
      } else if (actualTime > target.targetSeconds) {
        alert(` Target exceeded for "${task.name}"!`);
      } else {
        alert(` Target failed for "${task.name}". `);
      }

      const index = userTargets.indexOf(target);
      if (index !== -1) {
        userTargets.splice(index, 1);
        allTargets[user.email] = userTargets;
        localStorage.setItem("targetTasks", JSON.stringify(allTargets));
      }
    }
  });
}