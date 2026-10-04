const state = { todos: [], filter: "all" };
const list = document.querySelector("#todo-list");
const form = document.querySelector("#todo-form");
const message = document.querySelector("#message");
const apiBase = window.location.port === "5500" ? "http://localhost:8080" : "";

document.querySelector("#today").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long", month: "short", day: "numeric"
}).format(new Date());

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}

async function loadTodos() {
  try {
    state.todos = await request(`${apiBase}/api/todos`);
    render();
  } catch (error) {
    showMessage(error.message);
  }
}

function showMessage(text) {
  message.textContent = text;
  window.setTimeout(() => { if (message.textContent === text) message.textContent = ""; }, 4000);
}

function visibleTodos() {
  return state.todos.filter(todo =>
    state.filter === "active" ? !todo.completed :
    state.filter === "completed" ? todo.completed : true
  );
}

function render() {
  const completed = state.todos.filter(todo => todo.completed).length;
  const active = state.todos.length - completed;
  document.querySelector("#all-count").textContent = state.todos.length;
  document.querySelector("#active-count").textContent = active;
  document.querySelector("#completed-count").textContent = completed;
  document.querySelector("#progress-label").textContent =
    `${state.todos.length ? Math.round(completed / state.todos.length * 100) : 0}% complete`;
  document.querySelector("#progress-bar").style.width =
    `${state.todos.length ? completed / state.todos.length * 100 : 0}%`;
  list.innerHTML = visibleTodos().map(todo => `
    <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
      <button class="check" aria-label="${todo.completed ? "Mark as active" : "Mark as completed"}"></button>
      <div class="todo-copy">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ""}
      </div>
      <div class="item-actions">
        <button class="icon-button edit" aria-label="Edit task">✎</button>
        <button class="icon-button delete" aria-label="Delete task">×</button>
      </div>
    </li>
  `).join("");
  document.querySelector("#empty-state").hidden = visibleTodos().length > 0;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const title = form.title.value.trim();
  if (!title) return;
  try {
    const todo = await request(`${apiBase}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ title, description: form.description.value, completed: false })
    });
    state.todos.unshift(todo);
    form.reset();
    render();
    form.title.focus();
  } catch (error) { showMessage(error.message); }
});

list.addEventListener("click", async event => {
  const item = event.target.closest(".todo-item");
  if (!item) return;
  const todo = state.todos.find(candidate => candidate.id === Number(item.dataset.id));
  if (!todo) return;
  if (event.target.closest(".check")) {
    await updateTodo(todo, { completed: !todo.completed });
  } else if (event.target.closest(".delete")) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await request(`${apiBase}/api/todos/${todo.id}`, { method: "DELETE" });
      state.todos = state.todos.filter(candidate => candidate.id !== todo.id);
      render();
    } catch (error) { showMessage(error.message); }
  } else if (event.target.closest(".edit")) {
    const title = window.prompt("Task title", todo.title);
    if (title === null) return;
    const description = window.prompt("Note (optional)", todo.description);
    if (description === null) return;
    await updateTodo(todo, { title, description });
  }
});

async function updateTodo(todo, changes) {
  try {
    const updated = await request(`${apiBase}/api/todos/${todo.id}`, {
      method: "PUT", body: JSON.stringify({ ...todo, ...changes })
    });
    state.todos = state.todos.map(candidate => candidate.id === todo.id ? updated : candidate);
    render();
  } catch (error) { showMessage(error.message); }
}

document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(candidate => candidate.classList.remove("active"));
  button.classList.add("active");
  state.filter = button.dataset.filter;
  render();
}));

document.querySelector("#clear-completed").addEventListener("click", async () => {
  const completed = state.todos.filter(todo => todo.completed);
  try {
    await Promise.all(completed.map(todo => request(`${apiBase}/api/todos/${todo.id}`, { method: "DELETE" })));
    state.todos = state.todos.filter(todo => !todo.completed);
    render();
  } catch (error) { showMessage(error.message); }
});

loadTodos();
