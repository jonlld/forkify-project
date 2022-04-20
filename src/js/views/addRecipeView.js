import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  // the hidden form
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was successfully uploaded :)';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  // call inside the constructor
  constructor() {
    // to use 'this'
    super();
    this._addHandlerShowWindow();
    this._addHandlerHideWindow();
  }

  _toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // nothing controller needs to tell us here
  _addHandlerShowWindow() {
    // use bind to point 'this' to object, otherwise will point to button in an event handler
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this._toggleWindow.bind(this));
    this._overlay.addEventListener('click', this._toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      // can use 'form data' browser API to get all data
      // pass in the form - returns an object we can spread into an array
      const dataArr = [...new FormData(this)];
      // usually recipe is an object - since ES2019 can use below to convert entries to an object (opposite of Object.entries method)
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  _generateMarkup() {}
}

// still need to import to controller to make sure this is run
export default new AddRecipeView();
