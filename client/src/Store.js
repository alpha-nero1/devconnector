import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers";

const middlewear = [thunk];
const initial_state = {};

/**
 * * Exports the store that react will use for the application.
 * First param: root reducer
 * Second param: store object
 * Third param: middlewear (uses compose to implement google redux devtools extension)
 */
const store = createStore(
  rootReducer,
  initial_state,
  compose(
    applyMiddleware(...middlewear),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
