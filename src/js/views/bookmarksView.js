import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';

// use previewView kind of as a child of bookmarks / results view
// when bookmarksView.render() is called, it then calls previewView.render() itself (with the false parameter) to set 'this' and generate preview markup...

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet. Find a nice recipe and bookmark it ;)';
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    // this._data is all the bookmarks
    // calling render and not previewView._generateMarkup as render first assigns 'this._data' - and adding a guard clause to exit and return the markup
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}

export default new BookmarksView();
