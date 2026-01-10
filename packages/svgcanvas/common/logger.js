/**
 * Centralized logging utility for SVGCanvas.
 * Provides configurable log levels and the ability to disable logging in production.
 * @module logger
 * @license MIT
 */

/**
 * Log levels in order of severity
 * @enum {number}
 */
export const LogLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4
}

/**
 * Logger configuration
 * @type {Object}
 */
const config = {
  currentLevel: LogLevel.WARN,
  enabled: true,
  prefix: '[SVGCanvas]'
}

/**
 * Set the logging level
 * @param {LogLevel} level - The log level to set
 * @returns {void}
 */
export const setLogLevel = (level) => {
  if (Object.values(LogLevel).includes(level)) {
    config.currentLevel = level
  }
}

/**
 * Enable or disable logging
 * @param {boolean} enabled - Whether logging should be enabled
 * @returns {void}
 */
export const setLoggingEnabled = (enabled) => {
  config.enabled = Boolean(enabled)
}

/**
 * Set the log prefix
 * @param {string} prefix - The prefix to use for log messages
 * @returns {void}
 */
export const setLogPrefix = (prefix) => {
  config.prefix = String(prefix)
}

/**
 * Format a log message with prefix and context
 * @param {string} message - The log message
 * @param {string} [context=''] - Optional context information
 * @returns {string} Formatted message
 */
const formatMessage = (message, context = '') => {
  const contextStr = context ? ` [${context}]` : ''
  return `${config.prefix}${contextStr} ${message}`
}

/**
 * Log an error message
 * @param {string} message - The error message
 * @param {Error|any} [error] - Optional error object or additional data
 * @param {string} [context=''] - Optional context (e.g., module name)
 * @returns {void}
 */
export const error = (message, error, context = '') => {
  if (!config.enabled || config.currentLevel < LogLevel.ERROR) return

  console.error(formatMessage(message, context))
  if (error) {
    console.error(error)
  }
}

/**
 * Log a warning message
 * @param {string} message - The warning message
 * @param {any} [data] - Optional additional data
 * @param {string} [context=''] - Optional context (e.g., module name)
 * @returns {void}
 */
export const warn = (message, data, context = '') => {
  if (!config.enabled || config.currentLevel < LogLevel.WARN) return

  console.warn(formatMessage(message, context))
  if (data !== undefined) {
    console.warn(data)
  }
}

/**
 * Log an info message
 * @param {string} message - The info message
 * @param {any} [data] - Optional additional data
 * @param {string} [context=''] - Optional context (e.g., module name)
 * @returns {void}
 */
export const info = (message, data, context = '') => {
  if (!config.enabled || config.currentLevel < LogLevel.INFO) return

  console.info(formatMessage(message, context))
  if (data !== undefined) {
    console.info(data)
  }
}

/**
 * Log a debug message
 * @param {string} message - The debug message
 * @param {any} [data] - Optional additional data
 * @param {string} [context=''] - Optional context (e.g., module name)
 * @returns {void}
 */
export const debug = (message, data, context = '') => {
  if (!config.enabled || config.currentLevel < LogLevel.DEBUG) return

  console.debug(formatMessage(message, context))
  if (data !== undefined) {
    console.debug(data)
  }
}

/**
 * Get current logger configuration
 * @returns {Object} Current configuration
 */
export const getConfig = () => ({ ...config })

// Default export as namespace
export default {
  LogLevel,
  setLogLevel,
  setLoggingEnabled,
  setLogPrefix,
  error,
  warn,
  info,
  debug,
  getConfig
}
