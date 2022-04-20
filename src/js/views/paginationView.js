import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    // event delegation - add to common parent
    this._parentElement.addEventListener('click', function (e) {
      // searches up for closest 'btn' - works even if span or icon
      const btn = e.target.closest('.btn--inline');
      // guard clause to avoid error for click outside of button
      if (!btn) return;
      // using 'data-goto' attribute in markup
      const goToPage = +btn.dataset.goto;
      // pass to controller
      handler(goToPage);
    });
  }

  // this is called by render
  _generateMarkup() {
    // this._data comes from render, passed in by controller
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    const nextBtn = `
    <button data-goto="${
      curPage + 1
    }" class="btn--inline pagination__btn--next">
      <span>Page ${curPage + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>
  `;

    const prevBtn = `
    <button data-goto="${
      curPage - 1
    }" class="btn--inline pagination__btn--prev">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${curPage - 1}</span>
    </button>
  `;

    // Page 1 with other pages
    if (curPage === 1 && numPages > 1) {
      return nextBtn;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return prevBtn;
    }

    // Middle pages
    if (this._data.page < numPages) {
      return prevBtn + nextBtn;
    }

    // Page 1, no other pages
    return '';
  }
}

export default new PaginationView();
