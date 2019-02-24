// check if empty obj empty or string empty
const is_empty = val =>
  val === undefined ||
  val === null ||
  (typeof val === "object" && Object.keys(val).length === 0) ||
  (typeof val === "string" && val.trim().length === 0);

export default is_empty;
