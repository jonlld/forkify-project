import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

// store all our app data, including some we don't need right now - might become useful later
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

// refactor to use in multiple functions (loadRecipe, uploadRecipe)
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // trick to conditionally add properties
    // && short circuits if recipe.key is falsy
    // if has a value, object is returned
    // then spread to put key: value directly here
    ...(recipe.key && { key: recipe.key }),
  };
};

// controller will pass in the id; changes state object for controller to grab
export const loadRecipe = async function (id) {
  try {
    // calling another async from 'helpers.js' so need 'await' to consume/use the returned value
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    // add 'bookmarked' check to all recipes as loaded - to check later
    // checks if 'any' - returns true if any meet condition
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // console.log('STATE RECIPE :', state.recipe);
  } catch (err) {
    // throw again to push to controller
    throw err;
  }
};

// called by controller which will pass in the query
export const loadSearchResults = async function (query) {
  try {
    // store in state
    state.search.query = query;

    // & as already have a parameter marker '?'
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log('SEARCH DATA:', data);

    // loop array of objects and store (reformatted)
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });

    state.search.page = 1;
  } catch (err) {
    // throw again to handle upstream
    throw err;
  }
};

// set default to 1 (state starts at 1)
export const getSearchResultsPage = function (page = state.search.page) {
  // update page # in state
  state.search.page = page;
  // note the calculation for slice
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  // update ingredients
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity / state.recipe.servings) * newServings;
  });
  // update servings
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

// add whole data
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);
  // Mark loaded recipe as bookmarked if same
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

// delete, use only id - pretty common pattern
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

// for development only
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  // converts string back to object array
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    // to get array of nested key:value arrays from the object
    // console.log(Object.entries(newRecipe));

    // filter and return array of objects
    // not sure about this syntax: quantity: quantity ?
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());

        // throw error if any 'undefined' - to match API format
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // using API formating
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // post request will also send the recipe back to us, including key
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    // save to state.recipe
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    // to controller
    throw err;
  }
};
