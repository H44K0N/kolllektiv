const persons = ["Haakon", "Soro", "Henrik"]; // List of persons responsible

// Initialize tasks on page load
window.onload = () => {
  loadTasks();
};

// Handles checkbox behavior
function done(currentCheckbox) {
  const flexStripe = currentCheckbox.closest(".flex-stripe");
  const lastDoneElement = flexStripe.querySelector("#last-done");
  const personElement = flexStripe.querySelector("#person");

  // Update "last-done" to 0 days
  if (lastDoneElement) lastDoneElement.innerText = "0";

  // Automatically uncheck the checkbox after 2 seconds
  setTimeout(() => {
    currentCheckbox.checked = false;
  }, 2000);

  // Rotate the person responsible
  if (personElement) {
    const currentPerson = personElement.innerText;
    const currentIndex = persons.indexOf(currentPerson);
    const nextIndex = (currentIndex + 1) % persons.length; // Cycle to the next person
    personElement.innerText = persons[nextIndex];
  }

  // Save updated tasks to Local Storage
  saveTasks();
}

// Add a new task
function addTask() {
  const taskContainer = document.getElementById("task-container");

  const newTask = document.createElement("div");
  newTask.classList.add("flex-stripe");

  newTask.innerHTML = `
    <p id="task-name">New Task</p>
    <p id="interval">7</p>
    <p id="last-done">7</p>
    <p id="person">Haakon</p>
    <label>
      <input type="checkbox" onclick="done(this)" />
    </label>
    <button class="edit-task" onclick="editTask(this)">
      <i class="fas fa-edit"></i>
    </button>
    <button class="delete-task" onclick="deleteTask(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;

  taskContainer.appendChild(newTask);

  // Save updated tasks to Local Storage
  saveTasks();
}

// Edit the specific task where the button was clicked
function editTask(editButton) {
  const flexStripe = editButton.closest(".flex-stripe");

  const taskName = prompt("Enter the task name:", flexStripe.querySelector("#task-name").innerText);
  const interval = prompt("Enter the interval (in days):", flexStripe.querySelector("#interval").innerText.split(" ")[0]);
  const person = prompt("Enter the person responsible:", flexStripe.querySelector("#person").innerText);

  if (taskName) {
    flexStripe.querySelector("#task-name").innerText = taskName;
  }
  if (interval) {
    flexStripe.querySelector("#interval").innerText = `${interval}`;
  }
  if (person) {
    flexStripe.querySelector("#person").innerText = person;
  }

  // Reset the "last-done" value
  flexStripe.querySelector("#last-done").innerText = "0";

  // Save updated tasks to Local Storage
  saveTasks();
}

// Delete the specific task where the button was clicked
function deleteTask(deleteButton) {
    const flexStripe = deleteButton.closest(".flex-stripe");
  
    // Show a confirmation alert
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      flexStripe.remove(); // Remove the task from the DOM
      saveTasks(); // Update Local Storage after deletion
    }
  }

// Save all tasks to Local Storage
function saveTasks() {
  const taskContainer = document.getElementById("task-container");
  const tasks = Array.from(taskContainer.children).map((task) => ({
    name: task.querySelector("#task-name").innerText,
    interval: task.querySelector("#interval").innerText,
    lastDone: task.querySelector("#last-done").innerText,
    person: task.querySelector("#person").innerText,
  }));

  localStorage.setItem("tasks", JSON.stringify(tasks)); // Save tasks as JSON
}

// Load tasks from Local Storage
function loadTasks() {
  const taskContainer = document.getElementById("task-container");

  // Clear existing tasks to prevent duplicates
  taskContainer.innerHTML = "";

  const tasks = JSON.parse(localStorage.getItem("tasks")) || []; // Get tasks or fallback to empty array

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("flex-stripe");

    taskElement.innerHTML = `
      <p id="task-name">${task.name}</p>
      <p id="interval">${task.interval}</p>
      <p id="last-done">${task.lastDone}</p>
      <p id="person">${task.person}</p>
      <label>
        <input type="checkbox" onclick="done(this)" />
      </label>
      <button class="edit-task" onclick="editTask(this)">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-task" onclick="deleteTask(this)">
        <i class="fas fa-trash"></i>
      </button>
    `;

    taskContainer.appendChild(taskElement);
  });
}

// Sort tasks based on due dates
function sortTasks() {
  const taskContainer = document.getElementById("task-container");
  const tasks = Array.from(taskContainer.children);

  tasks.sort((a, b) => {
    const aInterval = parseInt(a.querySelector("#interval").innerText.split(" ")[0], 10);
    const bInterval = parseInt(b.querySelector("#interval").innerText.split(" ")[0], 10);

    return aInterval - bInterval; // Sort by interval in ascending order
  });

  // Append sorted tasks back to the container
  tasks.forEach((task) => taskContainer.appendChild(task));
}

// Auto-update tasks at midnight
function scheduleDailyUpdate() {
  sortTasks(); // Initial sort immediately
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Set to midnight
  const timeUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    sortTasks(); // Initial sort at midnight
    setInterval(sortTasks, 24 * 60 * 60 * 1000); // Repeat every 24 hours
  }, timeUntilMidnight);
}

// Initialize the daily scheduler
scheduleDailyUpdate();
