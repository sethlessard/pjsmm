export type Subproject = {
  
  /**
   * The path, relative to the configuration file, to the root of the Typescript subproject.
   */
  rootDir: string;
}

export interface ConfigurationFileEntity {

  /**
   * The ConfigurationFile version.
   */
  version: "1.0.0";

  /**
   * The TypeScript subprojects to manage.
   */
  projects: Subproject[];
}
