import { Subproject } from "../domain/entities/ConfigurationFileEntity";

/**
 * Check to see if there are excess properties in the configuration file.
 * @param configuration the configuration file.
 */
export function areThereExcessProjectProperties(projects: Subproject[]): boolean {
  for (const project of projects) {
    const keys = Object.keys(project);
    const pathIdx = keys.indexOf("rootDir");
    if (pathIdx !== -1) {
      keys.splice(pathIdx, 1);
    }

    if (keys.length > 0) { return true };
  }
  return false;
}
