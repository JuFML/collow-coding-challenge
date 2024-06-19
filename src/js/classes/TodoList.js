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
    this._assignDragEventListeners();
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

    todoItem.on("edit", ({id, title}) => {
      this.editTodo(id, title);
    });

    todoItem.on("dragstart", (id) => {
      this.dragStart(id)
    });

    todoItem.on("dragend", (id) => {
      this.dragEnd(id)
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
  editTodo(id, title) {
    let todoItem = this.todos.find(todo => todo.id === id)
    this._makeTodoItemEditable(todoItem)
    if (todoItem) {
      todoItem.title = title
      this._renderAll();
      this._saveTodosToLocalStorage()
    }    
  }

  /** filters the list of todos based on the search value and renders the filtered results */
  searchTodo(searchValue) {
    const todos = this.todos.filter(todo => todo.title.toLowerCase().includes(searchValue))

    this._renderFiltered(todos);
  }

  /** Initiates the drag operation for a todo item. */
  dragStart(id) {
    let todoItem = this.todos.find(todo => todo.id === id)

    todoItem.element.setAttribute('data-transfer', id);
    setTimeout(() => {
      todoItem.element.classList.add('hide');
    }, 0);
  }

  /** Ends the drag operation for a todo item. */
  dragEnd(id) {
    let todoItem = this.todos.find(todo => todo.id === id)
    todoItem.element.classList.remove('hide');
    // setTimeout(() => {
    //   todoItem.element.classList.remove('hide');
    // }, 0);
  }

  /** Prevents the default behavior for the dragover event. */
  dragOver(e) {
    e.preventDefault();
  }

  /** Handles the dragenter event when a dragged item enters a dropzone. */
  dragEnter(e) {
    e.preventDefault();
    if(Array.from(e.target.classList).includes("dropzone")){
      e.target.classList.add('drag-over');
    }
  }

  /** Handles the dragleave event when a dragged item leaves a dropzone. */
  dragLeave(e) {
    e.target.classList.remove('drag-over');
  }

  /** Handles the drop event when a dragged item is dropped onto a dropzone. */
  drop(e) {
    e.preventDefault();
    const dragItem = document.querySelector("[data-transfer]");
    const id = dragItem.getAttribute('data-transfer');

    e.target.classList.remove('drag-over');

    if (e.target.classList.contains('dropzone')) {
      document.querySelectorAll(".list-container").forEach(list => list.innerHTML="")
      let todoItem = this.todos.find(todo => todo.id === id)
      let todoItemStatus = todoItem.status
      let dropzoneId = e.target.id
      dragItem.removeAttribute('data-transfer');
      
      if(todoItemStatus !== dropzoneId.split('-')[0]) {
        this.toggleTodoStatus(id)
      } else {
        this._renderAll()
      }
    }    
  }

  /** makes a todo item editable by replacing its title with an input field. */ 
  _makeTodoItemEditable(todoItem) {
    if (todoItem) {     
        let todoItemHTML = todoItem.element;
        let titleElement = todoItemHTML.querySelector('.title');

        let input = document.createElement('input');
        input.type = 'text';
        input.value = todoItem.title;

        titleElement.innerText = "";
        titleElement.appendChild(input);

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

  /** saves the edited title of a todo item and updates the display. */
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

      todoItem.on("edit", ({id, title}) => {
        this.editTodo(id, title);
      });

      todoItem.on("dragstart", (id) => {
        this.dragStart(id)
      });

      todoItem.on("dragend", (id) => {
        this.dragEnd(id)
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

  /** renders all todos filtered */
  _renderFiltered(todos) {
    Object.values(this.statuses).forEach(status => {
      const filteredTodos = todos.filter(todo => todo.status === status);
      const statusElement = document.querySelector(`#${status}-list .list-container`);
      this._render(statusElement, filteredTodos);
    });
  }

  /** assigns event listeners to drag elements and drag zones*/
  _assignDragEventListeners() {
    const dropzones = document.querySelectorAll('.dropzone');

    dropzones.forEach(dropzone => {
      dropzone.addEventListener('dragover', this.dragOver);
      dropzone.addEventListener('dragenter', this.dragEnter);
      dropzone.addEventListener('dragleave', this.dragLeave);
      dropzone.addEventListener('drop', this.drop.bind(this));
    });
  }

  /** assigns event listeners to form elements */
  _assignFormEventListeners() {
    const addTodoHandler = () => {
      this.addTodo(input.value);
      input.value = '';
    };

    const addSearchHandler = () => {
      this.searchTodo(inputSearch.value)
    }

    // Find required elements
    const input = document.getElementById('todo-input');
    const addButton = document.getElementById('add_button');
    const inputSearch = document.getElementById('search-input');

    // Add event listeners to input field
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addTodoHandler();
      }
    });

    addButton.addEventListener('click', addTodoHandler);
    inputSearch.addEventListener('input', addSearchHandler)
    
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
