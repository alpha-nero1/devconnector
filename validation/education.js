const Validator = require("validator");
const is_empty = require("../util/is_empty");

/***
 *
 */
module.exports = function education_validator(data) {
  let errors = {};

  data.school = !is_empty(data.school) ? data.school : "";
  data.degree = !is_empty(data.degree) ? data.degree : "";
  data.field_of_study = !is_empty(data.field_of_study)
    ? data.field_of_study
    : "";
  data.from = !is_empty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required.";
  }

  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required.";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "Job from field is required.";
  }

  if (Validator.isEmpty(data.field_of_study)) {
    errors.field_of_study = "Field of study field is required.";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
