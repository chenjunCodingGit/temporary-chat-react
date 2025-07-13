var CSS_PREFIX = 'ali-'; // Use a unique prefix

/**
 * Add a unified prefix to the class name
 * @param className - Original class name
 * @returns {string} Class name with prefix added
 */
export var withPrefix = function withPrefix(className) {
  return "".concat(CSS_PREFIX).concat(className);
};