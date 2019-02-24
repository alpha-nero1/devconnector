const Validator = require("validator");
const is_empty = require("../util/is_empty");

/***
 *
 */
module.exports = function experience_validator(data) {
  let errors = {};

  data.title = !is_empty(data.title) ? data.title : "";
  data.company = !is_empty(data.company) ? data.company : "";
  data.from = !is_empty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Job title field is required.";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Job company field is required.";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "Job from field is required.";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
