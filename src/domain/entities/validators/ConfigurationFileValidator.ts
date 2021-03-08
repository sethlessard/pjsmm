import { ConfigurationFileEntity } from "../ConfigurationFileEntity";
import { ErrorCode } from "../ErrorCode";
import { ProjectEntity } from "../ProjectEntity";

export class ConfigurationFileValidator {

  private static readonly configurationFileProperties = [
    "version",
    "projects",
    "filePath"
  ];

  private static readonly projectProperties = [
    "rootDir"
  ];

  /**
   * Check to see if there are excess properties in the configuration file.
   * @param configuration the configuration file.
   * @returns true if there are excess properties.
   * @returns false if not.
   */
  static areThereExcessProperties(configuration: ConfigurationFileEntity): boolean {
    const keys = Object.keys(configuration);
    for (const requiredproperty of ConfigurationFileValidator.configurationFileProperties) {
      const idx = keys.indexOf(requiredproperty);
      if (idx !== -1) {
        keys.splice(idx, 1);
      }
    }
    return keys.length > 0;
  }

  /**
   * Check to see if there are excess properties in the configuration file.
   * @param configuration the configuration file.
   * @returns true if there are excess properties.
   * @returns false if the entires are valid.
   */
  static areThereExcessProjectProperties(projects: ProjectEntity[]): boolean {
    for (const project of projects) {
      const keys = Object.keys(project);
      for (const requiredproperty of ConfigurationFileValidator.projectProperties) {
        const idx = keys.indexOf(requiredproperty);
        if (idx !== -1) {
          keys.splice(idx, 1);
        }
      }

      if (keys.length > 0) { return true; }
    }
    return false;
  }

  /**
   * Validate a configuration file.
   * @param configuration the configuration file to validate.
   * @returns an ErrorCode if the configuraiton file contains an error.
   * @returns undefined if the configuration file is valid
   */
  static validate(configuration: ConfigurationFileEntity): ErrorCode | undefined {
    // there must be a version
    if (!configuration.version) {
      return ErrorCode.CONFIG_NO_VERSION;
    }
    // the version must be "1.0.0"
    if (configuration.version !== "1.0.0") {
      return ErrorCode.CONFIG_INVALID_VERSION;
    }
    if (!configuration.projects) {
      return ErrorCode.CONFIG_NO_PROJECTS_PROP;
    }
    if (configuration.projects.length === 0) {
      return ErrorCode.CONFIG_NO_PROJECTS;
    }
    if (ConfigurationFileValidator.areThereExcessProjectProperties(configuration.projects)) {
      return ErrorCode.CONFIG_INVALID_PROPERTY;
    }

    // check to see if there are excess properties at the root level
    if (ConfigurationFileValidator.areThereExcessProperties(configuration)) {
      return ErrorCode.CONFIG_INVALID_PROPERTY;
    }

    return undefined;
  }
}