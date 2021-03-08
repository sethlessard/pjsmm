import { dirname } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import rimraf from "rimraf";
import { v4 as uuid } from "uuid";
import { copySync } from "fs-extra";


const MergeDependenciesTemplateRoot = join(__dirname, "MergeDependencies", "templates");
export enum MergeDependenciesTemplate {
  ProjectWithExtraConfigProperty,
  ProjectWithInvalidVersion,
  ProjectWithNoProjectsProperty,
  ProjectWithNoSubprojects,
  ProjectWithNoConfigFile,
  ProjectWithNoVersion,
  ValidProjectWith3Subprojects
}
class MergeDependenciesTemplates {
  private static readonly ProjectWithExtraConfigProperty = join(MergeDependenciesTemplateRoot, "projectWithExtraConfigProperty");
  private static readonly ProjectWithInvalidVersion = join(MergeDependenciesTemplateRoot, "projectWithInvalidVersion");
  private static readonly ProjectWithNoProjectsProperty = join(MergeDependenciesTemplateRoot, "projectWithNoProjectsProperty");
  private static readonly ProjectWithNoSubprojects = join(MergeDependenciesTemplateRoot, "projectWithNoSubprojects");
  private static readonly ProjectWithNoTemplateFile = join(MergeDependenciesTemplateRoot, "projectWithNoConfigFile");
  private static readonly ProjectWithNoVersion = join(MergeDependenciesTemplateRoot, "projectWithNoVersion");
  private static readonly ValidProjectWith3Subprojects = join(MergeDependenciesTemplateRoot, "validProjectWith3Subprojects");

  /**
   * Get the path to a MergeDependencies e2e test template directory.
   * @param template the MergeDependenciesTemplate template type.
   * @returns the path to the template folder.
   */
  static getTemplatePath(template: MergeDependenciesTemplate): string {
    switch (template) {
    case MergeDependenciesTemplate.ProjectWithExtraConfigProperty:
      return MergeDependenciesTemplates.ProjectWithExtraConfigProperty;
    case MergeDependenciesTemplate.ProjectWithInvalidVersion:
      return MergeDependenciesTemplates.ProjectWithInvalidVersion;
    case MergeDependenciesTemplate.ProjectWithNoProjectsProperty:
      return MergeDependenciesTemplates.ProjectWithNoProjectsProperty;
    case MergeDependenciesTemplate.ProjectWithNoSubprojects:
      return MergeDependenciesTemplates.ProjectWithNoSubprojects;
    case MergeDependenciesTemplate.ProjectWithNoConfigFile:
      return MergeDependenciesTemplates.ProjectWithNoTemplateFile;
    case MergeDependenciesTemplate.ProjectWithNoVersion:
      return MergeDependenciesTemplates.ProjectWithNoVersion;
    case MergeDependenciesTemplate.ValidProjectWith3Subprojects:
      return MergeDependenciesTemplates.ValidProjectWith3Subprojects;
    }
  }
}

const ValidateConfigurationFileTemplateRoot = join(__dirname, "ValidateConfigurationFile", "templates");
export enum ValidateConfigTemplate {
  ProjectWithExtraConfigProperty,
  ProjectWithInvalidVersion,
  ProjectWithNoProjectsProperty,
  ProjectWithNoSubprojects,
  ProjectWithNoConfigFile,
  ProjectWithNoVersion,
  ProjectWithValidConfigFile
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
    case ValidateConfigTemplate.ProjectWithNoConfigFile:
      return ValidateConfigurationTemplate.ProjectWithNoTemplateFile;
    case ValidateConfigTemplate.ProjectWithNoVersion:
      return ValidateConfigurationTemplate.ProjectWithNoVersion;
    case ValidateConfigTemplate.ProjectWithValidConfigFile:
      return ValidateConfigurationTemplate.ProjectWithValidTemplateFile;
    }
  }
}
// sanity check to make sure the template paths exist
(() => {
  for (const key of Object.keys(MergeDependenciesTemplates)) {
    if ((key as keyof MergeDependenciesTemplates) === "getTemplatePath") {
      continue;
    }
    if (!existsSync(MergeDependenciesTemplates[key as keyof MergeDependenciesTemplates])) {
      throw new Error(`e2e configuration error!: Missing template file: ${MergeDependenciesTemplates[key as keyof MergeDependenciesTemplates]}`);
    }
  }
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
   * Setup a MergeDepdendencies test directory.
   * @param testDirectory the test directory.
   * @param template the ValidateConfigurationTemplate to use.
   */
  static setupMergeDependenciesTestDirectory(testDirectory: string, template: MergeDependenciesTemplate, silent = true): void {
    const templatePath = MergeDependenciesTemplates.getTemplatePath(template);
    if (!silent) {
      console.log(`Copying template files from '${templatePath}' to '${testDirectory}'`);
    }
    return copySync(templatePath, testDirectory, { recursive: true });
  }

  /**
   * Setup a ValidateConfig test directory.
   * @param testDirectory the test directory.
   * @param template the ValidateConfigurationTemplate to use.
   */
  static setupValidateConfigTestDirectory(testDirectory: string, template: ValidateConfigTemplate, silent = true): void {
    const templatePath = ValidateConfigurationTemplate.getTemplatePath(template);
    if (!silent) {
      console.log(`Copying template files from '${templatePath}' to '${testDirectory}'`);
    }
    return copySync(templatePath, testDirectory, { recursive: true });
  }
}
