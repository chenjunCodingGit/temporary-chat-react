const CSS_PREFIX = 'ali-'; // Use a unique prefix

/**
 * Add a unified prefix to the class name
 * @param className - Original class name
 * @returns {string} Class name with prefix added
 */
export const withPrefix = (className: string): string => {
  return `${CSS_PREFIX}${className}`;
};