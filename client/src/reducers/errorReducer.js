import { GET_ERRORS } from "../actions/types";

const initial_state = {};

export default function(state = initial_state, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload;
    default:
      return state;
  }
}
