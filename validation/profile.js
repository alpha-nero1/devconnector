const Validator = require("validator");
const is_empty = require("../util/is_empty");

module.exports = function profile_validator(data) {
  let errors = {};

  data.handle = !is_empty(data.handle) ? data.handle : "";
  data.status = !is_empty(data.status) ? data.status : "";
  data.skills = !is_empty(data.skills) ? data.skills : "";

  if (!Validator.isLength(data.handle, { min: 2, max: 40 }))
    errors.handle = "Handle is required to be 2 and 40 charaters.";

  if (Validator.isEmpty(data.handle)) errors.handle = "Handle is required";

  if (Validator.isEmpty(data.status))
    errors.status = "Status field is required.";

  if (Validator.isEmpty(data.skills))
    errors.status = "Skills field is required.";

  if (!isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) errors.website = "Not a valid url.";
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) errors.youtube = "Not a valid url.";
  }

  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) errors.twitter = "Not a valid url.";
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) errors.instagram = "Not a valid url.";
  }

  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) errors.facebook = "Not a valid url.";
  }

  if (!isEmpty(data.linked_in)) {
    if (!Validator.isURL(data.linked_in)) errors.linked_in = "Not a valid url.";
  }

  return {
    errors,
    valid: is_empty(errors)
  };
};
