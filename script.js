// let currentTaskIndex = null;
// let timerInterval;
// let previousStop = null;
// let previousDuration = 0;
// let startTime = null;
// let viewMode = showDashboard;

// function toggleLoginForm(forceShow = null) {
//   const form = document.getElementById("login-form");
//   if(forceShow == true){
//     form.style.display = "block";
//   }else if(forceShow === false){
//     form.style.display = "none";
//   }else{
//     form.style.display = form.style.display === "none" ? "block" : "none";
//   }
// }

// function login() {
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value;

//   const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

//   let errorMessage = '';

//   if (!gmailPattern.test(email)) {
//     errorMessage += "Please enter a valid Gmail address  ";
//   }

//   if (password.length < 8) {
//     errorMessage += "Password must be at least 8 characters long ";
//   }

//   if (errorMessage) {
//     alert(errorMessage);
//     return;
//   }

//   localStorage.setItem("user", JSON.stringify({ email }));
//   document.getElementById("login-form").style.display = "none";
//   document.getElementById("login-btn").innerText = "Logout";
//   document.getElementById("login-btn").onclick = logout;
//   document.getElementById("add-task-nav").style.display = "block";
//   loadTasks();
// }


// function logout() {
//   localStorage.removeItem("user");
//   localStorage.removeItem("currentTaskIndex");
//   // document.getElementById("tasks").innerHTML = ''
//   location.reload();
// }

// function showDashboard() {
//   viewMode = "dashboard";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "block";
//   document.getElementById("user-tasks-section").style.display = "none";
//   loadTasks();
// }

// function showAddTask() {
//   const user = localStorage.getItem("user");
//   if (!user) {
//     alert("Please login first to add a task");
//     toggleLoginForm(true);
//     return;
//   }
//   viewMode = "addTask";
//   document.getElementById("add-task-section").style.display = "block";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "none";
//   loadTasks(); 
// }

// function showTasks(){
//   viewMode = "tasks"
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "block";
//   document.getElementById("summary-section").style.display = "none";
//   loadTasks()
// }

  
// function addTask() {
//   const name = document.getElementById("task-name").value;
//   const desc = document.getElementById("task-description").value;

//   if (name && desc) {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

//     const user = JSON.parse(localStorage.getItem("user")); 
//     if (!user || !user.email) {
//       alert("User is not logged in");
//       return;
//     }

//     const today = new Date().toISOString().split("T")[0]; 
//     const startTime = new Date().toISOString(); 
//     const endTime = null; 

//     tasks.push({ name, description: desc, time: 0, created: today, email: user.email, startTime, endTime });

//     localStorage.setItem("tasks", JSON.stringify(tasks));

//     document.getElementById("task-name").value = '';
//     document.getElementById("task-description").value = '';

//     document.getElementById("tasks").style.display = "block";

//     loadTasks(); 
//   } else {
//     alert("Enter task name and description");
//   }
// }


// function startTaskTimer(index) {
//   if (timerInterval) clearInterval(timerInterval);

//   currentTaskIndex = index;
//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   if (!tasks[index]) return;

//   previousDuration = tasks[index].time || 0;
//   startTime = new Date();

//   timerInterval = setInterval(() => {
//     const now = new Date();
//     const elapsed = Math.floor((now - startTime) / 1000); // in seconds
//     const total = previousDuration + elapsed;

//     tasks[index].time = total;
//     localStorage.setItem("tasks", JSON.stringify(tasks));
//     loadTasks();
//   }, 1000);
// }


// function stopTaskTimer() {
//   if (timerInterval) clearInterval(timerInterval);

//   const stopTime = new Date();
//   if (currentTaskIndex === null) return;

//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const task = tasks[currentTaskIndex];
//   if (!task) return;

//   const elapsed = Math.floor((stopTime - startTime) / 1000); // in seconds
//   const totalDuration = previousDuration + elapsed;

//   task.time = totalDuration;
//   task.endTime = stopTime.toISOString();

//   localStorage.setItem("tasks", JSON.stringify(tasks));
//   currentTaskIndex = null;
//   previousDuration = 0;
//   startTime = null;
//   loadTasks();
// }


// function editCurrentTask(index) {
//   currentTaskIndex = index
//   if (currentTaskIndex !== null) {
//     const tasks = JSON.parse(localStorage.getItem("tasks"));
//     const newName = prompt("Edit Task Name", tasks[currentTaskIndex].name);
//     const newDesc = prompt("Edit Description", tasks[currentTaskIndex].description);
//     if (newName && newDesc) {
//       tasks[currentTaskIndex].name = newName;
//       tasks[currentTaskIndex].description = newDesc;
//       localStorage.setItem("tasks", JSON.stringify(tasks));
//       loadTasks();
//     }
//   }
// }

// function deleteTask(index){
//   const tasks = JSON.parse(localStorage.getItem("tasks"));
//   tasks.splice(index, 1)
//   localStorage.setItem("tasks", JSON.stringify(tasks))
//   loadTasks()
// }

// function showIndividualTotal(index) {
//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const task = tasks[index];
//   const totalSeconds = task.time;

//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   const displayEl = document.getElementById(`total-display-${index}`);
//   displayEl.innerText = `Total Time: ${hours}h ${minutes}m ${seconds}s`;
// }

// function loadTasks() {
//   let tasks = JSON.parse(localStorage.getItem("tasks"));
//   if (!Array.isArray(tasks)) tasks = [];

//   const storedIndex = localStorage.getItem("currentTaskIndex");
//   currentTaskIndex = storedIndex !== null ? parseInt(storedIndex) : null;

//   const taskContainer = document.getElementById("tasks");
//   taskContainer.innerHTML = '';

//   // Total time today
//   let totalSeconds = tasks.reduce((sum, task) => sum + task.time, 0);
//   document.getElementById("total-time").innerText = `Total Time Tracked Today: ${formatTime(totalSeconds)}`;

//   // Recent tasks
//   const recentList = document.getElementById("recent-tasks-list");
//   recentList.innerHTML = '';
//   let recentTasks = tasks.slice(-3).reverse();
//   recentTasks.forEach(task => {
//     const item = document.createElement("li");
//     item.textContent = task.name;
//     recentList.appendChild(item);
//   });

//   if (viewMode === "user") return;

//   if (viewMode === "full") {
//     tasks.forEach((task, index) => {
//       const taskEl = document.createElement("div");
//       taskEl.className = "task";
//       taskEl.innerHTML = `
//         <strong>${task.name}</strong>
//         <p>${task.description}</p>
//         <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//         <div class="tasks" style="display: block; margin-top: 10px">
//           <button class="styled-btn" onclick="startTaskTimer(${index})">Start</button>
//           <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
//           <button class="styled-btn" onclick="editCurrentTask(${index})">Edit</button>
//           <button class="styled-btn" onclick="deleteTask(${index})">Delete Task</button>
//         </div>
//       `;
//       taskContainer.appendChild(taskEl);
//     });
//   } else if (viewMode === "dashboard" && currentTaskIndex !== null && tasks[currentTaskIndex]) {
//     const task = tasks[currentTaskIndex];

//     const taskEl = document.createElement("div");
//     taskEl.className = "task";
//     taskEl.innerHTML = `
//       <strong>${task.name}</strong>
//       <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//     `;
//     taskContainer.appendChild(taskEl);

//   } else if (viewMode === "tasks") {
//     if (tasks.length === 0) {
//       taskContainer.innerHTML = '<p class="task-space">No tasks available. Add a new task.</p>';
//     } else {
//       tasks.forEach((task, index) => {
//         const taskEl = document.createElement("div");
//         taskEl.className = "task";
//         taskEl.innerHTML = `
//           <strong>${task.name}</strong>
//           <p class="space">${task.description}</p>
//           <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//           <div class="tasks" style="display: block; margin-top: 10px">
//             <button class="styled-btn" onclick="startTaskTimer(${index})" type="button">Start</button>
//             <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
//             <button class="styled-btn" onclick="editCurrentTask(${index})" type="button">Edit</button>
//             <button class="styled-btn" id="style-btn" onclick="deleteTask(${index})">Delete Task</button>
//           </div>
//         `;
//         taskContainer.appendChild(taskEl);
//       });
//     }
//   }
// }

// function formatTime(seconds){
//   const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
//   const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//   const secs = String(seconds % 60).padStart(2, '0');
//   return `${hrs}:${mins}:${secs}`;
// }


// function toggleSubmenu() {
//   const dailyTasks = document.getElementById("daily-tasks");
//   const userTasks = document.getElementById("userTasks")

//   const arrow = document.getElementById("arrow");

//   const isVisible = dailyTasks.style.display === "block";
//   const isVisible2 = userTasks.style.display === "block";

//   dailyTasks.style.display = isVisible ? "none" : "block";
//   userTasks.style.display = isVisible2 ? "none" : "block";
//   arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
// }

// function showDailyTasks() {
//   viewMode = "tasks";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks").style.display = "block";
//   document.getElementById("summary-section").style.display = "none";
//   document.getElementById("user-tasks-section").style.display = "none";

//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const today = new Date().toISOString().split("T")[0]; 

//   const taskContainer = document.getElementById("tasks");
//   taskContainer.innerHTML = '';

//   const dailyTasks = tasks
//     .map((task, i) => ({ ...task, originalIndex: i }))
//     .filter(task => task.created === today);

//   if (dailyTasks.length === 0) {
//     taskContainer.innerHTML = '<p class="task-space">No daily tasks for today.</p>';
//   } else {
//     dailyTasks.forEach((task) => {
//       const taskEl = document.createElement("div");
//       taskEl.className = "task";
//       taskEl.innerHTML = `
//         <strong>${task.name}</strong>
//         <p class="space">${task.description}</p>
//         <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//         <div class="tasks" style="display: block; margin-bottom: 10px">
//             <button class="styled-btn" onclick="showIndividualTotal(${task.originalIndex})">Total</button>
//         </div>
//         <p id="total-display-${task.originalIndex}" style="font-weight: bold; color: #333;"></p>
//       `;
//       taskContainer.appendChild(taskEl);
//     });
//   }
// }

// function showUser() {
//   viewMode = "user";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("tasks").style.display = "none";
//   document.getElementById("user-tasks-section").style.display = "block";

//   const user = JSON.parse(localStorage.getItem("user"));
//   const userTaskList = document.getElementById("user-tasks-list");
//   userTaskList.innerHTML = ''

//   if (user && user.email){
//     const userEl = document.createElement("div")
//     userEl.className = "task";
//     userEl.innerHTML = `
//       <strong>User</strong>
//       <p>Email: ${user.email}</p>
//     `;
//     userTaskList.appendChild(userEl);

//     const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     const userTasks = tasks.filter(task => task.email === user.email);

//     if(userTasks.length > 0){
//       userTasks.forEach(task => {
//         const startDate = new Date(task.startTime);
//         const endDate = task.endTime ? new Date(task.endTime) : null;

//         const taskEl = document.createElement("div");
//         taskEl.className = "task";
//         taskEl.innerHTML = `
//           <hr>
//           <strong>Task: ${task.name}</strong>
//           <p>Description: ${task.description || "No description"}</p>
//           <p>Start: ${startDate.toLocaleString()}</p>
//           ${endDate ? `<p>End: ${endDate.toLocaleString()}</p>` : ''}
//           <p>Month: ${startDate.toLocaleString('default', { month: 'long' })}</p>
//           <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//         `;
//         userTaskList.appendChild(taskEl);
//       });
//     }else{
//       userTaskList.innerHTML += '<p>No tasks available for this user.</p>';
//     }
//   }else{
//     userTaskList.innerHTML = '<p>No user is currently logged in</p>'
//   }
  
// }

// window.onload = function () {
//   const user = localStorage.getItem("user");

//   if (user) {
//     document.getElementById("login-btn").innerText = "Logout";
//     document.getElementById("login-btn").onclick = logout;
//     document.getElementById("add-task-nav").style.display = "block";
//   } else {
//     document.getElementById("login-btn").innerText = "Login";
//     document.getElementById("login-btn").onclick = toggleLoginForm;
//    // document.getElementById("add-task-nav").style.display = "none";
//   }

//   viewMode = "dashboard"; 
//   loadTasks();
// }

// let currentTaskIndex = null;
// let timerInterval;
// let previousStop = null;
// let previousDuration = 0;
// let startTime = null;
// let viewMode = showDashboard;

// function toggleLoginForm(forceShow = null) {
//   const form = document.getElementById("login-form");
//   if (forceShow === true) {
//     form.style.display = "block";
//   } else if (forceShow === false) {
//     form.style.display = "none";
//   } else {
//     form.style.display = form.style.display === "none" ? "block" : "none";
//   }
// }

// function login() {
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value;

//   const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//   let errorMessage = '';

//   if (!gmailPattern.test(email)) {
//     errorMessage += "Please enter a valid Gmail address. ";
//   }

//   if (password.length < 8) {
//     errorMessage += "Password must be at least 8 characters long. ";
//   }

//   if (errorMessage) {
//     alert(errorMessage);
//     return;
//   }

//   localStorage.setItem("user", JSON.stringify({ email }));
//   document.getElementById("login-form").style.display = "none";
//   document.getElementById("login-btn").innerText = "Logout";
//   document.getElementById("login-btn").onclick = logout;
//   document.getElementById("add-task-nav").style.display = "block";
//   loadTasks();
// }

// function logout() {
//   localStorage.removeItem("user");
//   localStorage.removeItem("currentTaskIndex");
//   location.reload();
// }

// function showDashboard() {
//   viewMode = "dashboard";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "block";
//   document.getElementById("user-tasks-section").style.display = "none";
//   loadTasks();
// }

// function showAddTask() {
//   const user = localStorage.getItem("user");
//   if (!user) {
//     alert("Please login first to add a task");
//     toggleLoginForm(true);
//     return;
//   }
//   viewMode = "addTask";
//   document.getElementById("add-task-section").style.display = "block";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "none";
//   loadTasks();
// }

// function showTasks() {
//   viewMode = "tasks";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "block";
//   document.getElementById("summary-section").style.display = "none";
//   loadTasks();
// }

// function addTask() {
//   const name = document.getElementById("task-name").value;
//   const desc = document.getElementById("task-description").value;

//   if (name && desc) {
//     let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     const user = JSON.parse(localStorage.getItem("user"));

//     if (!user || !user.email) {
//       alert("User is not logged in");
//       return;
//     }

//     const today = new Date().toISOString().split("T")[0];
//     const startTime = new Date().toISOString();

//     tasks.push({
//       name,
//       description: desc,
//       time: 0,
//       created: today,
//       email: user.email,
//       startTime,
//       endTime: null
//     });

//     localStorage.setItem("tasks", JSON.stringify(tasks));
//     document.getElementById("task-name").value = '';
//     document.getElementById("task-description").value = '';
//     document.getElementById("tasks").style.display = "block";
//     loadTasks();
//   } else {
//     alert("Enter task name and description");
//   }
// }

// function startTaskTimer(index) {
//   if (timerInterval) clearInterval(timerInterval);

//   currentTaskIndex = index;
//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   if (!tasks[index]) return;

//   previousDuration = tasks[index].time || 0;
//   startTime = new Date();

//   timerInterval = setInterval(() => {
//     const now = new Date();
//     const elapsed = Math.floor((now - startTime) / 1000);
//     const total = previousDuration + elapsed;
//     tasks[index].time = total;
//     localStorage.setItem("tasks", JSON.stringify(tasks));
//     loadTasks();
//   }, 1000);
// }

// function stopTaskTimer() {
//   if (timerInterval) clearInterval(timerInterval);
//   const stopTime = new Date();

//   if (currentTaskIndex === null) return;

//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const task = tasks[currentTaskIndex];
//   if (!task) return;

//   const elapsed = Math.floor((stopTime - startTime) / 1000);
//   const totalDuration = previousDuration + elapsed;

//   task.time = totalDuration;
//   task.endTime = stopTime.toISOString();

//   localStorage.setItem("tasks", JSON.stringify(tasks));
//   currentTaskIndex = null;
//   previousDuration = 0;
//   startTime = null;
//   loadTasks();
// }

// function editCurrentTask(index) {
//   currentTaskIndex = index;
//   if (currentTaskIndex !== null) {
//     const tasks = JSON.parse(localStorage.getItem("tasks"));
//     const newName = prompt("Edit Task Name", tasks[currentTaskIndex].name);
//     const newDesc = prompt("Edit Description", tasks[currentTaskIndex].description);
//     if (newName && newDesc) {
//       tasks[currentTaskIndex].name = newName;
//       tasks[currentTaskIndex].description = newDesc;
//       localStorage.setItem("tasks", JSON.stringify(tasks));
//       loadTasks();
//     }
//   }
// }

// function deleteTask(index) {
//   const tasks = JSON.parse(localStorage.getItem("tasks"));
//   tasks.splice(index, 1);
//   localStorage.setItem("tasks", JSON.stringify(tasks));
//   loadTasks();
// }

// function showIndividualTotal(index) {
//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const task = tasks[index];
//   const totalSeconds = task.time;

//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
//   const seconds = totalSeconds % 60;

//   const displayEl = document.getElementById(`total-display-${index}`);
//   displayEl.innerText = `Total Time: ${hours}h ${minutes}m ${seconds}s`;
// }

// function loadTasks() {
//   let tasks = JSON.parse(localStorage.getItem("tasks"));
//   if (!Array.isArray(tasks)) tasks = [];

//   const storedIndex = localStorage.getItem("currentTaskIndex");
//   currentTaskIndex = storedIndex !== null ? parseInt(storedIndex) : null;

//   const taskContainer = document.getElementById("tasks");
//   taskContainer.innerHTML = '';

//   const totalSeconds = tasks.reduce((sum, task) => sum + task.time, 0);
//   document.getElementById("total-time").innerText = `Total Time Tracked Today: ${formatTime(totalSeconds)}`;

//   const recentList = document.getElementById("recent-tasks-list");
//   recentList.innerHTML = '';
//   let recentTasks = tasks.slice(-3).reverse();
//   recentTasks.forEach(task => {
//     const item = document.createElement("li");
//     item.textContent = task.name;
//     recentList.appendChild(item);
//   });

//   if (viewMode === "user") return;

//   if (viewMode === "dashboard" && currentTaskIndex !== null && tasks[currentTaskIndex]) {
//     const task = tasks[currentTaskIndex];
//     const taskEl = document.createElement("div");
//     taskEl.className = "task";
//     taskEl.innerHTML = `
//       <strong>${task.name}</strong>
//       <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//     `;
//     taskContainer.appendChild(taskEl);
//   } else if (viewMode === "tasks" || viewMode === "full") {
//     if (tasks.length === 0) {
//       taskContainer.innerHTML = '<p class="task-space">No tasks available. Add a new task.</p>';
//     } else {
//       tasks.forEach((task, index) => {
//         const taskEl = document.createElement("div");
//         taskEl.className = "task";
//         taskEl.innerHTML = `
//           <strong>${task.name}</strong>
//           <p class="space">${task.description}</p>
//           <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//           <div class="tasks" style="margin-top: 10px">
//             <button class="styled-btn" onclick="startTaskTimer(${index})">Start</button>
//             <button class="styled-btn" onclick="stopTaskTimer()">Stop</button>
//             <button class="styled-btn" onclick="editCurrentTask(${index})">Edit</button>
//             <button class="styled-btn" onclick="deleteTask(${index})">Delete Task</button>
//           </div>
//         `;
//         taskContainer.appendChild(taskEl);
//       });
//     }
//   }
// }

// function formatTime(seconds) {
//   const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
//   const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//   const secs = String(seconds % 60).padStart(2, '0');
//   return `${hrs}:${mins}:${secs}`;
// }

// function toggleSubmenu() {
//   const dailyTasks = document.getElementById("daily-tasks");
//   const userTasks = document.getElementById("userTasks");
//   const arrow = document.getElementById("arrow");

//   const isVisible = dailyTasks.style.display === "block";
//   const isVisible2 = userTasks.style.display === "block";

//   dailyTasks.style.display = isVisible ? "none" : "block";
//   userTasks.style.display = isVisible2 ? "none" : "block";
//   arrow.innerHTML = isVisible ? "&#9662;" : "&#9650;";
// }

// function showDailyTasks() {
//   viewMode = "tasks";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("tasks").style.display = "block";
//   document.getElementById("summary-section").style.display = "none";
//   document.getElementById("user-tasks-section").style.display = "none";

//   const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//   const today = new Date().toISOString().split("T")[0];
//   const taskContainer = document.getElementById("tasks");
//   taskContainer.innerHTML = '';

//   const dailyTasks = tasks
//     .map((task, i) => ({ ...task, originalIndex: i }))
//     .filter(task => task.created === today);

//   if (dailyTasks.length === 0) {
//     taskContainer.innerHTML = '<p class="task-space">No daily tasks for today.</p>';
//   } else {
//     dailyTasks.forEach(task => {
//       const taskEl = document.createElement("div");
//       taskEl.className = "task";
//       taskEl.innerHTML = `
//         <strong>${task.name}</strong>
//         <p class="space">${task.description}</p>
//         <p><strong>Time:</strong> ${formatTime(task.time || 0)}</p>
//         <div class="tasks" style="margin-bottom: 10px">
//           <button class="styled-btn" onclick="showIndividualTotal(${task.originalIndex})">Total</button>
//         </div>
//         <p id="total-display-${task.originalIndex}" style="font-weight: bold; color: #333;"></p>
//       `;
//       taskContainer.appendChild(taskEl);
//     });
//   }
// }

// function showUser() {
//   viewMode = "user";
//   document.getElementById("add-task-section").style.display = "none";
//   document.getElementById("summary-section").style.display = "none";
//   document.getElementById("tasks-section").style.display = "none";
//   document.getElementById("tasks").style.display = "none";
//   document.getElementById("user-tasks-section").style.display = "block";

//   const user = JSON.parse(localStorage.getItem("user"));
//   const userTaskList = document.getElementById("user-tasks-list");
//   userTaskList.innerHTML = '';

//   if (user && user.email) {
//     const userEl = document.createElement("div");
//     userEl.className = "task";
//     userEl.innerHTML = `<strong>User</strong><p>Email: ${user.email}</p>`;
//     userTaskList.appendChild(userEl);

//     const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
//     const userTasks = tasks.filter(task => task.email === user.email);

//     if (userTasks.length > 0) {
//       userTasks.forEach(task => {
//         const startDate = new Date(task.startTime);
//         const endDate = task.endTime ? new Date(task.endTime) : null;

//         const taskEl = document.createElement("div");
//         taskEl.className = "task";
//         taskEl.innerHTML = `
//           <hr>
//           <strong>Task: ${task.name}</strong>
//           <p>Description: ${task.description || "No description"}</p>
//           <p>Start: ${startDate.toLocaleString()}</p>
//           <p>End: ${endDate ? endDate.toLocaleString() : "Running"}</p>
//           <p>Total Time: ${formatTime(task.time)}</p>
//         `;
//         userTaskList.appendChild(taskEl);
//       });
//     }
//   }
// }

// window.onload = function () {
//   const user = localStorage.getItem("user");

//   if (user) {
//     document.getElementById("login-btn").innerText = "Logout";
//     document.getElementById("login-btn").onclick = logout;
//     document.getElementById("add-task-nav").style.display = "block";
//   } else {
//     document.getElementById("login-btn").innerText = "Login";
//     document.getElementById("login-btn").onclick = toggleLoginForm;
//    // document.getElementById("add-task-nav").style.display = "none";
//   }

//   viewMode = "dashboard"; 
//   loadTasks();
// }


 // this  is my code in this i need to calculate the total duration of a patricular task by the diffrence 
 // of a start time is substract by the end time and that diffrence only be displayed but it just countind the seconds only i no need like
 // and when i restart the task the previous end time should be substract by the current end time and that value is updated to the  previous duration
 // dose my code in that or make it as in that way  . and give full js updated code ok





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

function displaySections(activeSection) {
  const sections = {
    "add-task": "add-task-section",
    "tasks": "tasks-section",
    "summary": "summary-section",
    "user": "user-tasks-section"
  };

  for (const key in sections) {
    const sectionId = sections[key];
    document.getElementById(sectionId).style.display = (key === activeSection) ? "block" : "none";
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

        taskEl.innerHTML = `
          <strong>${task.name}</strong>
          <p class="space">${task.description}</p>
          <p><strong>Time:</strong> <span id="timer-display-${index}">${formatTime(calculateDuration(task))}</span></p>
          <div class="tasks" style="margin-top: 10px">
             <button id="start-btn-${index}" class="styled-btn" onclick="event.stopPropagation(); startTaskTimer(${index})">
              ${task.startTime ? "Resume" : "Start"}
            </button>

            <button id="stop-btn-${index}" class="styled-btn" onclick="event.stopPropagation(); stopTaskTimer(${index})">Stop</button>
            <button class="styled-btn" onclick="event.stopPropagation(); editCurrentTask(${index})">Edit</button>
            <button class="styled-btn" onclick="event.stopPropagation(); deleteTask(${index})">Delete</button>
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

function changeStartToResume(index) {
  const startBtn = document.getElementById(`start-btn-${index}`);
  if (startBtn && startBtn.innerText !== "Resume") {
    startBtn.innerText = "Resume";
  }
}



// function formatTime(seconds) {
//   const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
//   const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
//   const s = String(seconds % 60).padStart(2, '0');
//   return `${h}:${m}:${s}`;
// }



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
  displaySections("tasks");

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

  if (!task.startTime && !task.endTime) {
    // First time starting
    task.startTime = new Date().toISOString();
    task.sessions.push({ start: Date.now(), end: Date.now() }); // at stop time

    startButton.innerText = "Start"; // Show Start
  } else if (!task.startTime && task.endTime) {
    // Resuming task after stopping
    task.startTime = new Date().toISOString();
    task.sessions.push({ start: Date.now(), end: Date.now() }); // at stop time

    startButton.innerText = "Resume"; // Keep Resume
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
  const startButton = document.getElementById(`start-btn-${currentTaskIndex}`);

  const now = new Date();
  const sessionDuration = (now - new Date(task.sessions[task.sessions.length - 1].start)) / 1000; // in seconds
  task.sessions[task.sessions.length - 1].end = now.toISOString(); // Mark the end time of the current session

  // Update total time by adding the current session's duration
  task.totalSeconds = (task.totalSeconds || 0) + Math.floor(sessionDuration);

  task.startTime = null;  // Reset start time after stopping the task

  localStorage.setItem("tasks", JSON.stringify(tasks));
  currentTaskIndex = null;
  startTime = null;

  loadTasks();
}


function calculateDuration(task) {
  // Return the total accumulated seconds for this task
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
        // Function to calculate duration for sessions
        const calculateDuration = (start, stop) => {
          if (start && stop) {
            return Math.floor((stop - start) / 1000);
          }
          return 0;
        };

        // Session 0 = main start/stop
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

        // Remaining sessions = Resume sessions
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


