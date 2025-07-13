"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withPrefix = void 0;
var CSS_PREFIX = 'ali-'; // Use a unique prefix

/**
 * Add a unified prefix to the class name
 * @param className - Original class name
 * @returns {string} Class name with prefix added
 */
var withPrefix = exports.withPrefix = function withPrefix(className) {
  return "".concat(CSS_PREFIX).concat(className);
};