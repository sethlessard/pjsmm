export enum ErrorCode {
  /**
   * Configuration related errors
   */
  CONFIG_NO_FILE,
  CONFIG_EMPTY_FILE,
  CONFIG_NO_VERSION,
  CONFIG_INVALID_VERSION,
  CONFIG_INVALID_PROPERTY,
  CONFIG_NO_PROJECTS_PROP,
  CONFIG_BAD_JSON,

  /**
   * General error (refer to the Error object.)
   */
  GENERAL

}
