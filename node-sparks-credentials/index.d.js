/**
 * Server scope (client, internal, etc.).
 *
 * @typedef {symbol} ServerScope
 */

/**
 * Server project name.
 *
 * @typedef {string} ServerProject
 */

/**
 * Server environment (integration, staging, production, etc.).
 *
 * @typedef {symbol} ServerEnvironment
 */

/**
 * Server type (web, database, etc.).
 *
 * @typedef {symbol} ServerType
 */

/**
 * Server index (00-99).
 *
 * @typedef {string} ServerIndex
 */

 /**
 * Server specifications.
 *
 * @typedef {object} ServerSpecifications
 * @property {ServerScope} scope - Server scope.
 * @property {ServerProject} project - Server project name.
 * @property {ServerEnvironment} environment - Server environment.
 * @property {ServerType} type - Server type.
 * @property {ServerIndex} index - Server index.
 */

/**
 * Server key (SCOPE-PROJECT-ENVIRONMENT-TYPE-INDEX).
 *
 * @typedef {string} ServerKey
 */
