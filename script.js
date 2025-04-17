let currentTaskIndex = null;
let timerInterval = null;
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
  // localStorage.removeItem("currentTaskIndex");
  // document.getElementById("tasks").innerHTML = ''
  location.reload();
}




function showDashboard() {
  viewMode = "dashboard";
  document.getElementById("add-task-section").style.display = "none";
  document.getElementById("tasks-section").style.display = "none";
  document.getElementById("summary-section").style.display = "block";
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
    let tasks = JSON.parse(localStorage.getItem("tasks"));

    if(!Array.isArray(tasks)){
      tasks = []
    }

    tasks.push({ name, description: desc, time: 0, sessions: [] });
    //currentTaskIndex = tasks.length - 1;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    //localStorage.setItem("currentTaskIndex", currentTaskIndex);

    document.getElementById("task-name").value = '';
    document.getElementById("task-description").value = '';

    document.getElementById("tasks").style.display = "block";

    loadTasks();
  } else {
    alert("Enter task name and description");
  }
}
  
function startTaskTimer(index){
  currentTaskIndex = index;
  localStorage.setItem("currentTaskIndex", currentTaskIndex);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks[currentTaskIndex].time += 1;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
  }, 1000);
}

function stopTaskTimer() {
  clearInterval(timerInterval);
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

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!Array.isArray(tasks)) tasks = [];

  const storedIndex = localStorage.getItem("currentTaskIndex");
  currentTaskIndex = storedIndex !== null ? parseInt(storedIndex) : null;

  const taskContainer = document.getElementById("tasks")
  taskContainer.innerHTML = '';

  // total time today

  let totalSeconds = tasks.reduce((sum, task) => sum + task.time, 0);
  let hrs = Math.floor(totalSeconds / 3600);
  let mins = Math.floor((totalSeconds % 3600) / 60);
  let secs = totalSeconds % 60
  document.getElementById("total-time").innerText = `Total Time Tracked Today: ${hrs}h ${mins}m ${secs}`;

  // recent task
  const recentList = document.getElementById("recent-tasks-list");
  recentList.innerHTML = '';
  let recentTasks = tasks.slice(-3).reverse();
  recentTasks.forEach(task => {
    const item = document.createElement("li");
    item.textContent = task.name
    recentList.appendChild(item);
  });

  if (viewMode === "full") {

    // full view

    tasks.forEach((task, index) => {
      let hours = Math.floor(task.time % 3600);
      let minutes = Math.floor((task.time % 3600) / 60);
      let seconds = task.time % 60;

      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.innerHTML = `
        <strong>${task.name}</strong>
        <p>${task.description}</p>
        <p>Duration:${hours}h ${minutes}m ${seconds}s</p>
        <div class="tasks" style="display: block; margin-top: 10px">
          <button class="styled-btn" onclick="startTaskTimer(${index})">Start</button>
          <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
          <button class="styled-btn" onclick="editCurrentTask(${index})">Edit</button>
          <button class="styled-btn" onclick="deleteTask(${index})">Delete Task</button>
        </div>
      `;
      taskContainer.appendChild(taskEl);
    });
  }else if (viewMode === "dashboard" && currentTaskIndex !== null && tasks[currentTaskIndex]){

    // dashboard view

    const task = tasks[currentTaskIndex];
    let hours = Math.floor(task.time / 3600);
    let minutes = Math.floor((task.time % 3600)/ 60);
    let seconds = task.time % 60;

    const taskEl = document.createElement("div");
    taskEl.className = "task";
    taskEl.innerHTML = `
      <strong>${task.name}</strong>
      <p>Duration: ${hours}h ${minutes}m ${seconds}s</p>
    `
    taskContainer.appendChild(taskEl);
  
  }else if (viewMode === "tasks"){

    // tasks view
    if (tasks.length === 0){
      taskContainer.innerHTML = '<p>No tasks available. Add a new task.</p>'
    }else{
      tasks.forEach((task, index) => {
        let hours = Math.floor(task.time / 3600);
        let minutes = Math.floor((task.time % 3600) / 60);
        let seconds = task.time % 60;
    
        const taskEl = document.createElement("div");
        taskEl.className = "task";
        taskEl.innerHTML = `
          <strong>${task.name}</strong>
          <p>${task.description}</p>
          <p>Duration:${hours}h ${minutes}m ${seconds}s</p>
          <div class="tasks" style="display: block; margin-top: 10px">
            <button class="styled-btn" onclick="startTaskTimer(${index})">Start</button>
            <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
            <button class="styled-btn" onclick="editCurrentTask(${index})">Edit</button>
            <button class="styled-btn" onclick="deleteTask(${index})">Delete Task</button>
            <button class="styled-btn" onclick="showIndividualTotal(${index})">Total</button>
          </div>
          <p id="total-display-${index}" style="font-weight: bold; color: #333;"></p>
        `;
        taskContainer.appendChild(taskEl)
      })
    }  
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

