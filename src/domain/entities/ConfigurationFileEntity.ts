import { ProjectEntity } from "./ProjectEntity";

export interface ConfigurationFileEntity {

  /**
   * The ConfigurationFile version.
   */
  version: "1.0.0";

  /**
   * The TypeScript subprojects to manage.
   */
  projects: ProjectEntity[];
}
