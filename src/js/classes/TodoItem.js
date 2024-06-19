import EventClass from "./EventClass.js";

class TodoItem extends EventClass {
  element;
  onDelete;
  id;
  title;
  status;

  /**
   * Represents a TodoItem.
   * @constructor
   * @param {string} title - The title of the TodoItem.
   * @param {Object} options - The options for the TodoItem.
   * @param {HTMLElement} options.template - The template element for the TodoItem.
   */
  constructor(title, { template }) {
    super();
    this.element = template.cloneNode(true);
    this.id = Math.random().toString(36).substr(2, 9);
    this.title = title;
    this.status = 'active';
    this._createTodoElement();

    return this;
  }

  _createTodoElement() {
    this.element.querySelector('.title').innerText = this.title;
    this.element.querySelector('.title')
      .addEventListener('dblclick', () => this.emit("edit", {id: this.id, title: this.title}))
    this.element.querySelector('button.delete')
      .addEventListener('click', () => this.emit("delete", this.id));
    this.element.querySelector('.toggle-checkbox')
      .addEventListener('click', () => this.emit("toggle", this.id));
    this.element.addEventListener('dragstart', () => this.emit("dragstart", this.id));
    this.element.addEventListener('dragend', () => this.emit("dragend", this.id));

    return this.element;
  }
}

export default TodoItem;
