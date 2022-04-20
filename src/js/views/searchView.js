class SearchView {
  // form
  _parentElement = document.querySelector('.search');

  // input value
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // call only internally so mark private
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    // add to form, works if click or hit enter
    this._parentElement.addEventListener('submit', function (e) {
      // need for forms to stop page reload
      e.preventDefault();
      // then call handler
      handler();
    });
  }
}

// export class instance, not the class itself
export default new SearchView();
