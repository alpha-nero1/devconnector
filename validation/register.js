const Validator = require("validator");
const is_empty = require("../util/is_empty");

module.exports = function registration_validator(data) {
  let errors = {};

  data.name = !is_empty(data.name) ? data.name : "";
  data.email = !is_empty(data.email) ? data.email : "";
  data.password = !is_empty(data.password) ? data.password : "";
  data.password_two = !is_empty(data.password_two) ? data.password_two : "";

  if (!Validator.isLength(data.name, { min: 3, max: 30 })) {
    errors.name = "Name must be between 3 and 30 characters";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is requireed";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is requireed";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is requireed";
  }

  if (!(Validator.isLength(data.password), { min: 6, max: 40 })) {
    errors.password = "Password must be atleast 6 characters";
  }

  if (Validator.isEmpty(data.password_two)) {
    errors.password_two = "Second password field is requireed";
  }

  if (!Validator.equals(data.password, data.password_two)) {
    errors.password_two = "Password fields must match";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
