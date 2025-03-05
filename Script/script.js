function enterFullScreen() {
  const doc = document.documentElement; // Select the full page

  if (doc.requestFullscreen) {
    doc.requestFullscreen().catch(err => console.warn("Full-screen request failed:", err));
  } else if (doc.mozRequestFullScreen) { // Firefox
    doc.mozRequestFullScreen();
  } else if (doc.webkitRequestFullscreen) { // Chrome, Safari, Opera
    doc.webkitRequestFullscreen();
  } else if (doc.msRequestFullscreen) { // Edge, IE
    doc.msRequestFullscreen();
  }
}

// Auto-request full-screen mode after user interaction
document.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    enterFullScreen();
  }
});

// Ensure full-screen stays active on orientation change (mobile/tablet)
window.addEventListener("orientationchange", () => {
  if (!document.fullscreenElement) {
    enterFullScreen();
  }
});


let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Screen Wake Lock is active.");

    // If the wake lock is released (e.g., low battery), try to request it again
    wakeLock.addEventListener("release", () => {
      console.log("Screen Wake Lock released. Re-requesting...");
      requestWakeLock();
    });
  } catch (err) {
    console.error("Failed to acquire Wake Lock:", err);
  }
}

// Request wake lock when the page is visible
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    requestWakeLock();
  }
});

// Initial wake lock request
document.addEventListener("DOMContentLoaded", () => {
  requestWakeLock();
});





const persons = ["Haakon", "Soro", "Jonas"]; // List of persons responsible

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
     <label>
      <input type="checkbox" onclick="done(this)" />
    </label>
    <div class="marquee">
      <div class="marquee-content">New Task</div>
    </div>
    <p id="interval">7</p>
    <p id="last-done">7</p>
    <p id="person">Haakon</p>
    <button class="edit-task" onclick="editTask(this)">
      <i class="fas fa-edit"></i>
    </button>
    <button class="delete-task" onclick="deleteTask(this)">
      <i class="fas fa-trash"></i>
    </button>
  `;

  taskContainer.appendChild(newTask);

  saveTasks(); // Save only the new task

  // Apply marquee effect ONLY to the new task
  applyMarqueeEffect();
  updateTaskStyles();
}




// Edit a task
function editTask(editButton) {
  const flexStripe = editButton.closest(".flex-stripe");

  // Get the correct elements
  const taskNameElement = flexStripe.querySelector(".marquee-content"); // Fix: Now correctly selects the task name
  const intervalElement = flexStripe.querySelector("#interval");
  const lastDoneElement = flexStripe.querySelector("#last-done");
  const personElement = flexStripe.querySelector("#person");

  // Prompt the user for new values
  const taskName = prompt("Enter the task name:", taskNameElement.innerText);
  const interval = prompt("Enter the interval (in days):", intervalElement.innerText);
  const lastDone = prompt("Enter days remaining until due:", lastDoneElement.innerText);
  const person = prompt("Enter the person responsible:", personElement.innerText);

  // Update only if the user enters a value
  if (taskName !== null) taskNameElement.innerText = taskName;
  if (interval !== null) intervalElement.innerText = interval;
  if (lastDone !== null) lastDoneElement.innerText = lastDone;
  if (person !== null) personElement.innerText = person;

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
    name: task.querySelector(".marquee-content").innerText, // Fix: Correct selector for task name
    interval: task.querySelector("#interval").innerText,
    lastDone: task.querySelector("#last-done").innerText,
    person: task.querySelector("#person").innerText
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
      <label>
        <input type="checkbox" onclick="done(this)" />
      </label>
      <div class="marquee">
        <div class="marquee-content">${task.name}</div>
      </div>
      <p id="interval">${task.interval}</p>
      <p id="last-done">${task.lastDone}</p>
      <p id="person">${task.person}</p>
      <button class="edit-task" onclick="editTask(this)">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-task" onclick="deleteTask(this)">
        <i class="fas fa-trash"></i>
      </button>
    `;

    taskContainer.appendChild(taskElement);
  });

  updateTaskStyles(); // Ensure correct styling
  applyMarqueeEffect(); // Apply effect only where needed
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


function applyMarqueeEffect() {
  document.querySelectorAll(".marquee").forEach((marquee) => {
    const content = marquee.querySelector(".marquee-content");

    // Remove any existing duplicates before adding a new one
    const existingClone = marquee.querySelector(".marquee-duplicate");
    if (existingClone) existingClone.remove();

    // Check if the text overflows
    if (content.scrollWidth > marquee.clientWidth) {
      // Clone the content only if needed
      const clone = content.cloneNode(true);
      clone.classList.add("marquee-duplicate");
      marquee.appendChild(clone);

      // Get text width to calculate spacing and animation speed
      const textWidth = content.scrollWidth;

      // Set up proper positioning
      marquee.style.display = "flex";
      marquee.style.overflow = "hidden";
      marquee.style.whiteSpace = "nowrap";
      marquee.style.position = "relative";

      // Ensure the duplicate starts exactly after the first one
      clone.style.position = "absolute";
      clone.style.left = `${textWidth}px`;

      // Dynamically adjust speed based on text length
      const duration = Math.max(textWidth / 50, 5);

      // Apply identical animation to both instances
      content.style.animation = `marquee-scroll ${duration}s linear infinite`;
      clone.style.animation = `marquee-scroll ${duration}s linear infinite`;
    } else {
      // Disable animation if the text fits
      content.style.animation = "none";
    }
  });
}




// Run this function when tasks are loaded or added


document.getElementById("add-task-btn").addEventListener("click", () => {
  applyMarqueeEffect();
});
