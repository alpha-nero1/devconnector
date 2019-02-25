# DEV CONNECTOR MERN PROJECT

This project is a tutorial from Brad Traversy on udemy: https://www.udemy.com/mern-stack-front-to-back/

## Running the project

1. Enter in the root directory and run: `npm run dev` (This will run the server and client concurrently)
2. Ensure mongodb is install and in a seperate terminal: `mongod`

## The Node API

```
const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/api/users");
const profile = require("./routes/api/profiles");
const posts = require("./routes/api/posts");
const bodyParser = require("body-parser");
const passport = require("passport"); // main auth module

const app = express();

// The body parser allows us to access req.body.
// Body parser middlewear
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Database configuration
const db = require("./config/keys").mongoURI;

// Connect to mongodb
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log(`connected to mongodb at: ${db}`))
  .catch(err => console.log(err));

// Passport middlewear
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## How React - Redux works

### UI

The UI (client/App.js) below shows the layout of the project. Note the wrapping in the Provider
module to ensure contents have access to the imported global store.

```
import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux"; // imports the store
import store from "./Store";

import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";
import Register from "./components/authentication/Register";
import Login from "./components/authentication/Login";
import "./App.css";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <NavBar />
            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
```

### The Store

in "client/Store.js". The store is the global state for the application and is imported in
App.js to be used in the react application

```
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
```

### The Action

```
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

// Register
export const register_user = (user_data, history) => dispatch => {
  axios
    .post("/api/users/register", user_data)
    .then(() => history.push("/login"))
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

// Login
export const login_user = user_data => dispatch => {
  axios
    .post("/api/users/login", user_data)
    .then(res => {
      // Save token to local storage
      const { token } = res.data;

      // Set token to local storage
      localStorage.setItem("jwtToken", token);

      // Set token to auth header.
      setAuthToken(token);

      // Decode token to get user data
      const decoded = jwt_decode(token);

      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

```

### The Reducer

in `client/reducers/index.js`

```
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer
});
```

and in `client/reducers/authReducer`

```
import { SET_CURRENT_USER } from "../actions/types";
import is_empty from "../validation/is_empty";

const initial_state = {
  is_authenticated: false,
  user: {}
};

export default function(state = initial_state, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        is_authenticated: !is_empty(action.payload),
        user: action.payload
      };
    default:
      return state;
  }
}
```
