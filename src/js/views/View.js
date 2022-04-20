// exporting the actual class here because we do not create an instance of this parent view

import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render is false
   * @this {Object} View instance
   * @author JS
   * @todo Finish implementation
   */
  render(data, render = true) {
    // note can return a function call!
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();
    // console.log(markup);

    if (!render) return markup;

    // clear the container and insert
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 302.
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    // Virtual DOM
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    // Convert nodeLists to arrays
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    // Actual DOM
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // console.log(curEl, newEl.isEqualNode(curEl));

      /*
      'isEqualNode' returns false on updated nodes and parents - we want to test '!' this. We also want to filter - firstchild of a node (element) should be a 'text' node. If it is, 'nodeValue' returns that text, otherwise returns null.
      */

      // Updates changed TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        // console.log(newEl.firstChild?.nodeValue.trim());
        curEl.textContent = newEl.textContent;
      }

      // Updates changed ATTRIBUTES
      // Replace all in curEl with those coming from newEl
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          // takes name and sets value - replaces
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  // generic to attach to any parentEl - see also HTML / CSS
  renderSpinner() {
    const markup = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // set a default if nothing passed in - message itself is in the view
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
