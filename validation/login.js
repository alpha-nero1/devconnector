const Validator = require("validator");
const is_empty = require("../util/is_empty");

module.exports = function login_validator(data) {
  let errors = {};

  data.email = !is_empty(data.email) ? data.email : "";
  data.password = !is_empty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is requireed";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is requireed";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
