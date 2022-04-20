// sees both model and recipeView

// * = import everything
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// For Parcel - to maintain page state
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // guard clause instead of wrapping in if...else
    if (!id) return;

    recipeView.renderSpinner();

    // 0. Update results view & bookmarks to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. Loading Recipe (adds to 'state' in model.js)
    // async function calling another async function - asyncs always return a promise
    // here no return value per se, just updates 'state'
    await model.loadRecipe(id);

    // 2. Rendering Recipe (once await finished)
    recipeView.render(model.state.recipe);
  } catch (err) {
    // don't pass message in here, but set in view as private field & default parameter
    recipeView.renderError();
  }
};

// calling an async (loadSearchResults) so this will also be one
// this is passed as a handler to the listener in searchView - called by handler first, and this calls loadSearchResults in the model and updates 'state' for us
const controlSearchResults = async function () {
  // debugger;
  try {
    resultsView.renderSpinner();

    // 1 Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2 Load search results (side-effect only - updates state)
    await model.loadSearchResults(query);

    // 3 Render INITIAL results (passing in first x no. of results)
    resultsView.render(model.getSearchResultsPage());

    // 4 Render INITIAL pagination
    paginationView.render(model.state.search);
  } catch (err) {
    // here any errors passed up are eventually caught - log only here
    console.log(err);
  }
};

// called by publisher, passing in new page #
const controlPagination = function (goToPage) {
  // 1 Render NEW results & update state
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2 Render NEW buttons
  paginationView.render(model.state.search);
};

// called by listener
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add or Remove Bookmark

  // need 'if else' not 'if if'; otherwise both will execute if false first
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. Update recipeView (using the algo)
  recipeView.update(model.state.recipe);

  // 3. Render bookmarks (have full data in bookmarks array)
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show spinner while uploading
    addRecipeView.renderSpinner();

    // Upload new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Re-render bookmark view (to insert a new element, use 'render')
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL - history API
    // change without reloading page
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Timeout to close form (changed to arrow)
    setTimeout(() => addRecipeView._toggleWindow(), MODAL_CLOSE_SEC * 1000);

    // space
  } catch (err) {
    // the message we created in model.js
    addRecipeView.renderError(err.message);
    console.log('💥 ', err);
  }
};

// Publisher-subscriber pattern - pass in the function so view can call it
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
// debugger;
init();
