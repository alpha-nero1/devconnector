# DEV CONNECTOR MERN PROJECT

This project is a tutorial from Brad Traversy on udemy: https://www.udemy.com/mern-stack-front-to-back/
Also git-hub formatting for README.md can be found here: https://help.github.com/en/articles/basic-writing-and-formatting-syntax#content-attachments

## Running the project

1. Enter in the root directory and run: `npm run dev` (This will run the server and client concurrently)
2. Ensure mongodb is install and in a seperate terminal: `mongod`

## The Node API

### Server.js

The file `/server.js` uses `express`, `mongoose`, `body-parser` and `passport`.
Additonally it imports our routes to be used.

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

### /routes/api/users.js (Example Route)

Each router file imports `express` to use `const router = express.Router()` that way
router.get or .post etc. functions can be defined and then the router can be exported.
In `server.js` we can simply define `app.use("/api/users", users);` giving the path
and our imported route.

```
const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../../config/keys");

// Load input validator
const register_validator = require("../../validation/register");
const login_validator = require("../../validation/login");

const User = require("../../models/User");

const router = express.Router();

// @route   GET api/users/test
// @desc    tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users works" }));
```

## How React - Redux works

The react-redux workflow can be observed as such:

#### Reducers

Updates the state, takes and action and returns the new state.

#### Actions

Entails the actual action to be performed. (e.g an axios call to hit the API)

#### Store

The global state. Each reducer is assigned to a segment of the state.

#### View

The react component (connected to redux) that subscribes to the store 'segment'.
mapStateToProps ensures that the part of the global store is used as the components
props.

| --> View --Action--> Reducer --> Store- |
| --------------------------------------- |


### UI

The UI (`client/src/App.js`) below shows the layout of the project. Note the wrapping in the Provider
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

in `client/src/Store.js`. The store is the global state for the application and is imported in
App.js to be used in the react application. Note we are able to import `rootReducer` from `./reducers`
because the folder contains an `index.js` (Reducers section shows contents).

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

in `client/src/actions/authActions.js`. note the action function first accepts
the data and wraps a method taking dispatch. Because these actions are async we
call `dispatch({type: "", payload: ""});` instead of returning. dispatch calls upon
the reducer to do its job once the async task has been performed.

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

in `client/reducers/index.js` first the reducers need to be combined to comply with the
`createStore` first parameter. `client/Store.js` imports this.

```
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducer
});
```

and in `client/reducers/authReducer`. The reducer technically is a function accepting
the state and action. by convention, each action has a type (to identify what we want to do) and a payload
which is any related data we may need.

by declaring a switch on action.type we can update the state segment according to the action

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
