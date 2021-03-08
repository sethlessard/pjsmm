export enum ErrorCode {
  /**
   * Configuration related errors
   */

  /**
   * Occurs when a configuration file cannot be read
   */
  CONFIG_READ_ERROR = "CONFIG_READ_ERROR",
  
  /**
   * Occurs when a configuration file is empty.
   */
  CONFIG_EMPTY_FILE = "CONFIG_EMPTY_FILE",

  /**
   * Occurs when a configuration file is missing the 'version' property.
   */
  CONFIG_NO_VERSION = "CONFIG_NO_VERSION",
  
  /**
   * Occurs when an invalid version is supplied.
   */
  CONFIG_INVALID_VERSION = "CONFIG_INVALID_VERSION",

  /**
   * Occurs when an invalid property exists in the configuration.
   */
  CONFIG_INVALID_PROPERTY = "CONFIG_INVALID_PROPERTY",

  /**
   * Occurs when no projects are defined in the 'projects' property.
   */
  CONFIG_NO_PROJECTS = "CONFIG_NO_PROJECTS",

  /**
   * Occurs when the 'projects' property is missing.
   */
  CONFIG_NO_PROJECTS_PROP = "CONFIG_NO_PROJECTS_PROPERTY",

  /**
   * Occurs when the configuration file contains malformed JSON
   */
  CONFIG_BAD_JSON = "CONFIG_BAD_JSON",

  /**
   * General error (refer to the Error object.
   */
  GENERAL = "GENERAL",

  // Dependency-merge related errors   
  /**
   * Occurs when there are not enough subprojects to perform a merge
   */
  NOT_ENOUGH_PROJECTS = "NOT_ENOUGH_PROJECTS",

  /**
   * Occurs when there is no package.json file at the root level
   * where the configuration file lives.
   */
  NO_PACKAGE_JSON = "NO_PACKAGE_JSON",

  /**
   * General package.json read error.
   */
  PACKAGE_JSON_READ_ERROR = "PACKAGE_JSON_READ_ERROR"
}
