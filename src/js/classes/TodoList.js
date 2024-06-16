import { createDeepObserver } from "../helpers.js"; 
import TodoItem from "./TodoItem.js";

class TodoList {
  template;
  todos;
  statuses = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
  };

  constructor() {
    this._setTodoTemplate();
    this.todos = createDeepObserver([], this._renderAll.bind(this));
    this._assignFormEventListeners();
  }

  /** creates new todoItem instance, sets events and adds it to the todos list */
  addTodo(title) {
    
    if(!title.trim()) {
      return
    }

    const todoItem = new TodoItem(title, { template: this.template });

    todoItem.on("delete", (id) => {
      this.deleteTodo(id);
    });

    todoItem.on("toggle", (id) => {
      this.toggleTodoStatus(id);
    });

    this.todos.push(todoItem);
  }

  /** toggles todo item status based on given id */
  toggleTodoStatus(id) {
    let todoItem = this.todos.find(todo => todo.id === id)
    if (todoItem) {
      todoItem.status = todoItem.status === this.statuses.ACTIVE 
        ? this.statuses.COMPLETED 
        : this.statuses.ACTIVE;
      this._renderAll();
    }
  }

  /** deletes todo item based on given id */
  deleteTodo(id) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1); // Remove o item da lista observada
    }
  }

  /** Sets todoItem template html */
  _setTodoTemplate() {
    const templateElement = document.getElementById('todo-item-template');
    templateElement.removeAttribute('id');
    this.template = templateElement.cloneNode(true);
    templateElement.remove();
  }

  /** populates given list element with given todo items */
  _render(listElement, todos) {
    listElement.innerHTML = '';
    todos.forEach(todo => {
      listElement.appendChild(todo.element);
    });
  }

  /** renders all todos based on their status */
  _renderAll() {
    Object.values(this.statuses).forEach(status => {
      const filteredTodos = this.todos.filter(todo => todo.status === status);
      const statusElement = document.querySelector(`#${status}-list .list-container`);
      this._render(statusElement, filteredTodos);
    });
  }

  /** assigns event listeners to form elements */
  _assignFormEventListeners() {
    const addTodoHandler = () => {
      this.addTodo(input.value);
      input.value = '';
    };

    // Find required elements
    const input = document.getElementById('todo-input');
    const addButton = document.getElementById('add_button');

    // Add event listeners to input field
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTodoHandler();
      }
    });
    addButton.addEventListener('click', addTodoHandler);
    
    // TODO: When the "Generate" button is clicked, fetch a random task and add it to the input field
    const generateButton = document.getElementById('generate_button');
    generateButton.addEventListener('click', async () => {
      generateButton.disabled = true;
      const response = await fetch('https://dummyjson.com/todos/random');
      const data = await response.json();
      input.value = data.todo;
      generateButton.disabled = false
    });
  }
}

export default TodoList;
