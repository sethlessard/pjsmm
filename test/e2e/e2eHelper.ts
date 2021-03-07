import { dirname } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import rimraf from "rimraf";
import { v4 as uuid } from "uuid";
import { copySync } from "fs-extra";

const ValidateConfigurationFileTemplateRoot = join(__dirname, "ValidateConfigurationFile", "templates");

export enum ValidateConfigTemplate {
  ProjectWithExtraConfigProperty,
  ProjectWithInvalidVersion,
  ProjectWithNoProjectsProperty,
  ProjectWithNoSubprojects,
  ProjectWithNoTemplateFile,
  ProjectWithNoVersion,
  ProjectWithValidTemplateFile
}

class ValidateConfigurationTemplate {
  private static readonly ProjectWithExtraConfigProperty = join(ValidateConfigurationFileTemplateRoot, "projectWithExtraConfigProperty");
  private static readonly ProjectWithInvalidVersion = join(ValidateConfigurationFileTemplateRoot, "projectWithInvalidVersion");
  private static readonly ProjectWithNoProjectsProperty = join(ValidateConfigurationFileTemplateRoot, "projectWithNoProjectsProperty");
  private static readonly ProjectWithNoSubprojects = join(ValidateConfigurationFileTemplateRoot, "projectWithNoSubprojects");
  private static readonly ProjectWithNoTemplateFile = join(ValidateConfigurationFileTemplateRoot, "projectWithNoConfigFile");
  private static readonly ProjectWithNoVersion = join(ValidateConfigurationFileTemplateRoot, "projectWithNoVersion");
  private static readonly ProjectWithValidTemplateFile = join(ValidateConfigurationFileTemplateRoot, "projectWithValidConfigFile");

  /**
   * Get the path to a ValidateConfigFile template directory.
   * @param template the ValidateConfigFile template type.
   * @returns the path to the template folder.
   */
  static getTemplatePath(template: ValidateConfigTemplate): string {
    switch (template) {
    case ValidateConfigTemplate.ProjectWithExtraConfigProperty:
      return ValidateConfigurationTemplate.ProjectWithExtraConfigProperty;
    case ValidateConfigTemplate.ProjectWithInvalidVersion:
      return ValidateConfigurationTemplate.ProjectWithInvalidVersion;
    case ValidateConfigTemplate.ProjectWithNoProjectsProperty:
      return ValidateConfigurationTemplate.ProjectWithNoProjectsProperty;
    case ValidateConfigTemplate.ProjectWithNoSubprojects:
      return ValidateConfigurationTemplate.ProjectWithNoSubprojects;
    case ValidateConfigTemplate.ProjectWithNoTemplateFile:
      return ValidateConfigurationTemplate.ProjectWithNoTemplateFile;
    case ValidateConfigTemplate.ProjectWithNoVersion:
      return ValidateConfigurationTemplate.ProjectWithNoVersion;
    case ValidateConfigTemplate.ProjectWithValidTemplateFile:
      return ValidateConfigurationTemplate.ProjectWithValidTemplateFile;
    }
  }
}
// sanity check to make sure the template paths exist
(() => {
  // TODO: Merge use case templates
  for (const key of Object.keys(ValidateConfigurationTemplate)) {
    if ((key as keyof ValidateConfigurationTemplate) === "getTemplatePath") {
      continue;
    }
    if (!existsSync(ValidateConfigurationTemplate[key as keyof ValidateConfigurationTemplate])) {
      throw new Error(`e2e configuration error!: Missing template file: ${ValidateConfigurationTemplate[key as keyof ValidateConfigurationTemplate]}`);
    }
  }
})();

export class e2eHelper {

  /**
   * Cleanup a test directory.
   * @param directory the test directory.
   * @param silent if true, no console output will occur.
   */
  static cleanupTestDirectory(directory: string, silent = true): Promise<void> {
    return new Promise((resolve, reject) => {
      rimraf(directory, (error: Error) => {
        if (error) {
          reject(error);
        } else {
          if (!silent) {
            console.log(`Cleaned test directory: "${directory}"`);
          }
          resolve();
        }
      });
    });
  }

  /**
   * Get the project root. 
   * @returns the project root.
   */
  static getProjectRoot(): string {
    return dirname( // root/
      dirname(      // root/test/
        __dirname   // root/test/e2e
      )
    );
  }

  /**
   * Get a directory on the local filesystem that can be used for testing.
   * @param silent if set, no console output will occur.
   */
  static getTestDirectory(silent = true): Promise<string> {
    const directory = join(tmpdir(), "package-json-submodule-merge-tests", uuid());
    return mkdir(directory, { recursive: true })
      .then(() => {
        if (!silent) {
          console.error(`Created test directory: "${directory}"`);
        }
        return directory;
      });
  }

  /**
   * Setup a ValidateConfig test directory.
   * @param testDirectory setup a ValidateConfig test directory.
   * @param template the ValidateConfigurationTemplate to use.
   */
  static setupValidateConfigTestDirectory(testDirectory: string, template: ValidateConfigTemplate): void {
    const templatePath = ValidateConfigurationTemplate.getTemplatePath(template);
    console.log(`Copying template files from '${templatePath}' to '${testDirectory}'`);
    return copySync(templatePath, testDirectory, { recursive: true });
  }
}
