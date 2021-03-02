import { ConfigurationFileEntity } from "src/domain/entities/ConfigurationFileEntity";

/**
 * Check to see if there are excess properties in the configuration file.
 * @param configuration the configuration file.
 */
export function areThereExcessProperties(configuration: ConfigurationFileEntity): boolean {
  const keys = Object.keys(configuration);
  const versionIdx = keys.indexOf("version");
  if (versionIdx !== -1) {
    keys.splice(versionIdx, 1);
  }
  const projectsIdx = keys.indexOf("projects");
  if (projectsIdx !== -1) {
    keys.splice(projectsIdx, 1);
  }
  if (keys.length > 0) { return true; }
  return false;
}
