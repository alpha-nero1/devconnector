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
