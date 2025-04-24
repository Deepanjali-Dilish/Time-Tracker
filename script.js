let currentTaskIndex = null;
let timerInterval;
let viewMode = showDashboard;

function toggleLoginForm(forceShow = null) {
  const form = document.getElementById("login-form");
  if(forceShow == true){
    form.style.display = "block";
  }else if(forceShow === false){
    form.style.display = "none";
  }else{
    form.style.display = form.style.display === "none" ? "block" : "none";
  }
}

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  let errorMessage = '';

  if (!gmailPattern.test(email)) {
    errorMessage += "Please enter a valid Gmail address  ";
  }

  if (password.length < 8) {
    errorMessage += "Password must be at least 8 characters long ";
  }

  if (errorMessage) {
    alert(errorMessage);
    return;
  }

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
  // document.getElementById("tasks").innerHTML = ''
  location.reload();
}

function showDashboard() {
  viewMode = "dashboard";
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("summary-section").style.display = "block";
  document.getElementById("user-tasks-section").style.display = "none";
  loadTasks();
}

function showAddTask() {
  const user = localStorage.getItem("user");
  if (!user) {
    alert("Please login first to add a task");
    toggleLoginForm(true);
    return;
  }
  viewMode = "addTask";
  document.getElementById("add-task-section").style.display = "block";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("summary-section").style.display = "none";
  loadTasks(); 
}

function showTasks(){
  viewMode = "tasks"
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "block";
  document.getElementById("summary-section").style.display = "none";
  loadTasks()
}

  
function addTask() {
  const name = document.getElementById("task-name").value;
  const desc = document.getElementById("task-description").value;

  if (name && desc) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const user = JSON.parse(localStorage.getItem("user")); 
    if (!user || !user.email) {
      alert("User is not logged in");
      return;
    }

    const today = new Date().toISOString().split("T")[0]; 
    const startTime = new Date().toISOString(); 
    const endTime = null; 

    tasks.push({ name, description: desc, time: 0, created: today, email: user.email, startTime, endTime });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    document.getElementById("task-name").value = '';
    document.getElementById("task-description").value = '';

    document.getElementById("tasks").style.display = "block";

    loadTasks(); 
  } else {
    alert("Enter task name and description");
  }
}


function startTaskTimer(index) {
  if (timerInterval) {
    alert("A task is already running. Stop it before starting another.");
    return;
  }

  currentTaskIndex = index;
  localStorage.setItem("currentTaskIndex", currentTaskIndex);

  const tasks = JSON.parse(localStorage.getItem("tasks"));
  const task = tasks[currentTaskIndex];

  if (!task.startTime) {
    task.startTime = new Date().toISOString();
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  timerInterval = setInterval(() => {
    const updatedTasks = JSON.parse(localStorage.getItem("tasks"));
    updatedTasks[currentTaskIndex].time = (updatedTasks[currentTaskIndex].time || 0) + 1;
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    loadTasks();
  }, 1000);
}

function stopTaskTimer() {
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  if (currentTaskIndex !== null && tasks[currentTaskIndex]) {
    tasks[currentTaskIndex].endTime = new Date().toISOString();
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  clearInterval(timerInterval);
  timerInterval = null;
  currentTaskIndex = null;
}



function editCurrentTask(index) {
  currentTaskIndex = index
  if (currentTaskIndex !== null) {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    const newName = prompt("Edit Task Name", tasks[currentTaskIndex].name);
    const newDesc = prompt("Edit Description", tasks[currentTaskIndex].description);
    if (newName && newDesc) {
      tasks[currentTaskIndex].name = newName;
      tasks[currentTaskIndex].description = newDesc;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      loadTasks();
    }
  }
}

function deleteTask(index){
  const tasks = JSON.parse(localStorage.getItem("tasks"));
  tasks.splice(index, 1)
  localStorage.setItem("tasks", JSON.stringify(tasks))
  loadTasks()
}

function showIndividualTotal(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks[index];
  const totalSeconds = task.time;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const displayEl = document.getElementById(`total-display-${index}`);
  displayEl.innerText = `Total Time: ${hours}h ${minutes}m ${seconds}s`;
}

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!Array.isArray(tasks)) tasks = [];

  const storedIndex = localStorage.getItem("currentTaskIndex");
  currentTaskIndex = storedIndex !== null ? parseInt(storedIndex) : null;

  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = '';

  // Total time today
  let totalSeconds = tasks.reduce((sum, task) => sum + task.time, 0);
  document.getElementById("total-time").innerText = `Total Time Tracked Today: ${formatTime(totalSeconds)}`;

  // Recent tasks
  const recentList = document.getElementById("recent-tasks-list");
  recentList.innerHTML = '';
  let recentTasks = tasks.slice(-3).reverse();
  recentTasks.forEach(task => {
    const item = document.createElement("li");
    item.textContent = task.name;
    recentList.appendChild(item);
  });

  if (viewMode === "user") return;

  if (viewMode === "full") {
    tasks.forEach((task, index) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
        <strong>${task.name}</strong>
        <p>${task.description}</p>
        <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
        <div class="tasks" style="display: block; margin-top: 10px">
          <button class="styled-btn" onclick="startTaskTimer(${index})">Start</button>
          <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
          <button class="styled-btn" onclick="editCurrentTask(${index})">Edit</button>
          <button class="styled-btn" onclick="deleteTask(${index})">Delete Task</button>
        </div>
      `;
      taskContainer.appendChild(taskEl);
    });
  } else if (viewMode === "dashboard" && currentTaskIndex !== null && tasks[currentTaskIndex]) {
    const task = tasks[currentTaskIndex];

    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.innerHTML = `
      <strong>${task.name}</strong>
      <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
    `;
    taskContainer.appendChild(taskEl);

  } else if (viewMode === "tasks") {
    if (tasks.length === 0) {
      taskContainer.innerHTML = '<p class="task-space">No tasks available. Add a new task.</p>';
    } else {
      tasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.innerHTML = `
          <strong>${task.name}</strong>
          <p class="space">${task.description}</p>
          <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
          <div class="tasks" style="display: block; margin-top: 10px">
            <button class="styled-btn" onclick="startTaskTimer(${index})" type="button">Start</button>
            <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
            <button class="styled-btn" onclick="editCurrentTask(${index})" type="button">Edit</button>
            <button class="styled-btn" id="style-btn" onclick="deleteTask(${index})">Delete Task</button>
          </div>
        `;
        taskContainer.appendChild(taskEl);
      });
    }
  }
}

function formatTime(seconds){
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}


function toggleSubmenu() {
  const dailyTasks = document.getElementById("daily-tasks");
  const userTasks = document.getElementById("userTasks")

  const arrow = document.getElementById("arrow");

  const isVisible = dailyTasks.style.display === "block";
  const isVisible2 = userTasks.style.display === "block";

  dailyTasks.style.display = isVisible ? "none" : "block";
  userTasks.style.display = isVisible2 ? "none" : "block";
  arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
}

function showDailyTasks() {
  viewMode = "tasks";
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks").style.display = "block";
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("user-tasks-section").style.display = "none";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const today = new Date().toISOString().split("T")[0]; 

  const taskContainer = document.getElementById("tasks");
  taskContainer.innerHTML = '';

  const dailyTasks = tasks
    .map((task, i) => ({ ...task, originalIndex: i }))
    .filter(task => task.created === today);

  if (dailyTasks.length === 0) {
    taskContainer.innerHTML = '<p class="task-space">No daily tasks for today.</p>';
  } else {
    dailyTasks.forEach((task) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
        <strong>${task.name}</strong>
        <p class="space">${task.description}</p>
        <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
        <div class="tasks" style="display: block; margin-bottom: 10px">
            <button class="styled-btn" onclick="showIndividualTotal(${task.originalIndex})">Total</button>
        </div>
        <p id="total-display-${task.originalIndex}" style="font-weight: bold; color: #333;"></p>
      `;
      taskContainer.appendChild(taskEl);
    });
  }
}

function showUser() {
  viewMode = "user";
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("summary-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("tasks").style.display = "none";
  document.getElementById("user-tasks-section").style.display = "block";

  const user = JSON.parse(localStorage.getItem("user"));
  const userTaskList = document.getElementById("user-tasks-list");
  userTaskList.innerHTML = ''

  if (user && user.email){
    const userEl = document.createElement("div")
    userEl.className = "task";
    userEl.innerHTML = `
      <strong>User</strong>
      <p>Email: ${user.email}</p>
    `;
    userTaskList.appendChild(userEl);

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const userTasks = tasks.filter(task => task.email === user.email);

    if(userTasks.length > 0){
      userTasks.forEach(task => {
        const startDate = new Date(task.startTime);
        const endDate = task.endTime ? new Date(task.endTime) : null;

        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.innerHTML = `
          <hr>
          <strong>Task: ${task.name}</strong>
          <p>Description: ${task.description || "No description"}</p>
          <p>Start: ${startDate.toLocaleString()}</p>
          ${endDate ? `<p>End: ${endDate.toLocaleString()}</p>` : ''}
          <p>Month: ${startDate.toLocaleString('default', { month: 'long' })}</p>
          <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
        `;
        userTaskList.appendChild(taskEl);
      });
    }else{
      userTaskList.innerHTML += '<p>No tasks available for this user.</p>';
    }
  }else{
    userTaskList.innerHTML = '<p>No user is currently logged in</p>'
  }
  
}

window.onload = function () {
  const user = localStorage.getItem("user");

  if (user) {
    document.getElementById("login-btn").innerText = "Logout";
    document.getElementById("login-btn").onclick = logout;
    document.getElementById("add-task-nav").style.display = "block";
  } else {
    document.getElementById("login-btn").innerText = "Login";
    document.getElementById("login-btn").onclick = toggleLoginForm;
   // document.getElementById("add-task-nav").style.display = "none";
  }

  viewMode = "dashboard"; 
  loadTasks();
}




