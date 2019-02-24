const Validator = require("validator");
const is_empty = require("../util/is_empty");

module.exports = function post_validator(data) {
  let errors = {};

  data.text = !is_empty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post must be between 10 and 300 characters.";
  }

  if (!Validator.isEmpty(data.text)) {
    errors.text = "Post text is empty";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
