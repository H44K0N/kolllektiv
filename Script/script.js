const persons = ["Haakon", "Soro", "Henrik"]; // List of persons responsible

// Initialize tasks on page load
window.onload = () => {
  loadTasks();
  handleDailyDecrement(); // Check and decrement if needed
  scheduleDailyUpdate(); // Schedule future decrements
};

// Sort tasks based on due dates (ascending order)
function sortTasks() {
  const taskContainer = document.getElementById("task-container");
  const tasks = Array.from(taskContainer.children); // Convert NodeList to an array

  // Sort tasks by due date (last-done field)
  tasks.sort((a, b) => {
    const aDueDate = parseInt(a.querySelector("#last-done").innerText, 10);
    const bDueDate = parseInt(b.querySelector("#last-done").innerText, 10);
    return aDueDate - bDueDate; // Ascending order
  });

  // Reattach tasks in the new order
  tasks.forEach((task) => taskContainer.appendChild(task));

  // Update task styles after sorting
  updateTaskStyles();
}

// Handles checkbox behavior
function done(currentCheckbox) {
  const flexStripe = currentCheckbox.closest(".flex-stripe");
  const lastDoneElement = flexStripe.querySelector("#last-done");
  const intervalElement = flexStripe.querySelector("#interval");
  const personElement = flexStripe.querySelector("#person");

  // Reset "last-done" to the interval value (days until due)
  if (lastDoneElement && intervalElement) {
    lastDoneElement.innerText = intervalElement.innerText;
  }

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

  saveTasks(); // Save updated tasks
  updateTaskStyles(); // Update styles
  sortTasks(); // Re-sort tasks
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

  saveTasks(); // Save the new task
}

// Edit a task
function editTask(editButton) {
  const flexStripe = editButton.closest(".flex-stripe");

  const taskName = prompt("Enter the task name:", flexStripe.querySelector("#task-name").innerText);
  const interval = prompt("Enter the interval (in days):", flexStripe.querySelector("#interval").innerText);
  const lastDone = prompt("Enter days remaining until due:", flexStripe.querySelector("#last-done").innerText);
  const person = prompt("Enter the person responsible:", flexStripe.querySelector("#person").innerText);

  if (taskName) flexStripe.querySelector("#task-name").innerText = taskName;
  if (interval) flexStripe.querySelector("#interval").innerText = interval;
  if (lastDone) flexStripe.querySelector("#last-done").innerText = lastDone;
  if (person) flexStripe.querySelector("#person").innerText = person;

  saveTasks(); // Save the edits
  updateTaskStyles(); // Update styles
  sortTasks(); // Re-sort tasks
}

// Delete a task
function deleteTask(deleteButton) {
  const flexStripe = deleteButton.closest(".flex-stripe");

  if (confirm("Are you sure you want to delete this task?")) {
    flexStripe.remove();
    saveTasks(); // Save after deletion
  }
}

// Save tasks to Local Storage
function saveTasks() {
  const taskContainer = document.getElementById("task-container");
  const tasks = Array.from(taskContainer.children).map((task) => ({
    name: task.querySelector("#task-name").innerText,
    interval: task.querySelector("#interval").innerText,
    lastDone: task.querySelector("#last-done").innerText,
    person: task.querySelector("#person").innerText,
  }));

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from Local Storage
function loadTasks() {
  const taskContainer = document.getElementById("task-container");
  taskContainer.innerHTML = ""; // Clear existing tasks

  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
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

  updateTaskStyles(); // Update styles after loading
  sortTasks();
}

// Check and decrement tasks if 24 hours have passed
function handleDailyDecrement() {
  const lastUpdate = localStorage.getItem("lastUpdate");
  const now = Date.now();

  // If no timestamp or more than 24 hours have passed, decrement
  if (!lastUpdate || now - parseInt(lastUpdate, 10) >= 24 * 60 * 60 * 1000) {
    decrementDays();
    localStorage.setItem("lastUpdate", now); // Update the timestamp
  }
}

// Decrement remaining days for all tasks
function decrementDays() {
  const tasks = document.querySelectorAll(".flex-stripe");
  tasks.forEach((task) => {
    const lastDoneElement = task.querySelector("#last-done");
    if (lastDoneElement) {
      const lastDone = parseInt(lastDoneElement.innerText, 10);
      lastDoneElement.innerText = lastDone - 1; // Decrement
    }
  });

  saveTasks(); // Save changes
  updateTaskStyles(); // Refresh styles
}

// Schedule future decrements at midnight
function scheduleDailyUpdate() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight.getTime() - now.getTime();

  setTimeout(() => {
    decrementDays(); // First decrement at midnight
    setInterval(decrementDays, 24 * 60 * 60 * 1000); // Repeat daily
  }, timeUntilMidnight);
}

// Update task styles based on remaining days
function updateTaskStyles() {
  const tasks = document.querySelectorAll(".flex-stripe");

  tasks.forEach((task) => {
    const lastDoneElement = task.querySelector("#last-done");
    if (!lastDoneElement) return;

    const lastDone = parseInt(lastDoneElement.innerText, 10);
    if (lastDone < 0) {
      task.style.backgroundColor = "#BC4749"; // Overdue
    } else if (lastDone <= 3) {
      task.style.backgroundColor = "#D7DC5D"; // Close to due
    } else {
      task.style.backgroundColor = "#6A994E"; // Default
    }
  });
}
