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
    this._loadTodosFromLocalStorage(); 
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

    todoItem.on("dblclick", ({id, title}) => {
      this.editTodo({id, title});
    });

    this.todos.push(todoItem);
    this._saveTodosToLocalStorage()
  }

  /** toggles todo item status based on given id */
  toggleTodoStatus(id) {
    let todoItem = this.todos.find(todo => todo.id === id)
    if (todoItem) {
      todoItem.status = todoItem.status === this.statuses.ACTIVE 
        ? this.statuses.COMPLETED 
        : this.statuses.ACTIVE;
      this._renderAll();
      this._saveTodosToLocalStorage()
    }    
  }

  /** deletes todo item based on given id */
  deleteTodo(id) {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
      this._saveTodosToLocalStorage()
    }
  }

  /** edit todo item based on given id */
  editTodo({id, title}) {
    let todoItem = this.todos.find(todo => todo.id === id)
    this._makeTodoItemEditable(todoItem)
    if (todoItem) {
      todoItem.title = title
      this._renderAll();
      this._saveTodosToLocalStorage()
    }    
  }

  _makeTodoItemEditable(todoItem) {
    if (todoItem) {     
        let todoItemHTML = todoItem.element;
        console.log(todoItemHTML)
        let titleElement = todoItemHTML.querySelector('.title');
        console.log(titleElement)

        let input = document.createElement('input');
        input.type = 'text';
        input.value = todoItem.title;

        titleElement.innerText = "";
        titleElement.appendChild(input);
        // titleElement.querySelector('input').focus()

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              this._saveEditedTodoItem(todoItem, input.value);
          }
        });

        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              this._saveEditedTodoItem(todoItem, input.value);
          }
        });

        input.addEventListener('blur', () => {
            this._saveEditedTodoItem(todoItem, input.value);
        });
    }
  }

  _saveEditedTodoItem(todoItem, newTitle) {
    todoItem.title = newTitle;
    let todoItemHTML = todoItem.element;
    let titleElement = todoItemHTML.querySelector('.title');
    titleElement.innerText = newTitle
    
    this._saveTodosToLocalStorage()
  }

   /** Loads todos from localStorage */
   _loadTodosFromLocalStorage() {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    savedTodos.forEach(savedTodo => {
      const todoItem = new TodoItem(savedTodo.title, { template: this.template });
      todoItem.id = savedTodo.id;
      todoItem.status = savedTodo.status;

      todoItem.on("delete", (id) => {
        this.deleteTodo(id);
      });

      todoItem.on("toggle", (id) => {
        this.toggleTodoStatus(id);
      });

      todoItem.on("dblclick", ({id, title}) => {
        this.editTodo({id, title});
      });

      this.todos.push(todoItem);
    });
    this._renderAll();
  }

  /** Saves todos to localStorage */
  _saveTodosToLocalStorage() {
    const todosToSave = [...this.todos]
    localStorage.setItem('todos', JSON.stringify(todosToSave));
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
