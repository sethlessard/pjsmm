
import { spawn } from "child_process";
import { dirname, join } from "path";

import { ConfigurationService } from "../../datasources/services/ConfigurationService";
import { PackageJsonService } from "../../datasources/services/PackageJsonService";
import { TSConfigService } from "../../datasources/services/TSConfigService";
import { ConfigurationFileEntity } from "../../entities/ConfigurationFileEntity";
import { ErrorCode } from "../../entities/ErrorCode";
import { ErrorResponseEntity } from "../../entities/ErrorResponseEntity";
import { PartialPackageJsonEntity } from "../../entities/PartialPackageJsonEntity";
import { ProjectEntity } from "../../entities/ProjectEntity";
import { inject, injectable } from "tsyringe";
import { UseCase } from "../UseCase";
import { MergeDependenciesRequestEntity } from "./MergeDependenciesRequestEntity";
import { MergeDependenciesResponseEntity } from "./MergeDependenciesResponseEntity";
import { ConfigurationFileValidator } from "../../entities/validators/ConfigurationFileValidator";
import { mergeDependencies } from "./helpers/mergeDependencies";

@injectable()
export class MergeDependenciesUseCase extends UseCase<MergeDependenciesRequestEntity, MergeDependenciesResponseEntity> {

  private static readonly DEFAULT_CONFIG_PATH = join(process.cwd(), ".tsprm.json");

  /**
   * Create a new MergeDependenciesUseCase instance.
   * @param configurationService the configuration service.
   * @param packageJsonService the package.json service.
   * @param tsconfigService the tsconfig.json service.
   */
  constructor(
    @inject("ConfigurationService") private readonly configurationService: ConfigurationService,
    @inject("PackageJsonService") private readonly packageJsonService: PackageJsonService,
    @inject("TSConfigService") private readonly tsconfigService: TSConfigService
  ) {
    super();
  }

  /**
   * Merge the dependencies of two or more package.josn files from typescript subprojects
   * into a single package.json.
   */
  protected async usecaseLogic(): Promise<MergeDependenciesResponseEntity | ErrorResponseEntity> {
    let { configFilePath } = this._param;
    const { devDependencies, installOptions } = this._param;
    
    if (!configFilePath) {
      configFilePath = MergeDependenciesUseCase.DEFAULT_CONFIG_PATH;
    }

    // read the configuration
    let configuration: ConfigurationFileEntity | undefined;
    try {
      configuration = await this.configurationService.readConfigurationFile(configFilePath);
      if (!configuration) {
        return { success: false, errorCode: ErrorCode.CONFIG_EMPTY_FILE };
      }
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_READ_ERROR };
    }

    // validate the config file
    const validationError = ConfigurationFileValidator.validate(configuration);
    if (validationError) {
      return { success: false, errorCode: validationError };
    }

    // verify there is a package.json at the same level of the configuation
    const projectRoot: string = dirname(configFilePath);
    const mainPackageJson = await this.packageJsonService.readPackageJson(projectRoot);
    if (!mainPackageJson) {
      return { success: false, errorCode: ErrorCode.NO_PACKAGE_JSON };
    }

    if (configuration.projects.length < 2) {
      return { success: false, errorCode: ErrorCode.NOT_ENOUGH_PROJECTS };
    }

    // filter out projects that do not have a tsconfig.json file
    const ignoredProjects: ProjectEntity[] = [];
    const filterProjects = async (projects: ProjectEntity[]): Promise<ProjectEntity[]> => {
      const filtered: ProjectEntity[] = [];
      for (const p of projects) {
        if (await this.tsconfigService.isThereATSConfig(join(projectRoot, p.rootDir))) {
          filtered.push(p);
        } else {
          ignoredProjects.push(p);
        }
      }
      return filtered;
    };

    const projects = await filterProjects(configuration.projects);

    // read the package.json files
    const packageJsonFiles: PartialPackageJsonEntity[] = [];
    try {
      for (const p of projects) {
        const packageJson = await this.packageJsonService.readPackageJson(join(projectRoot, p.rootDir));
        if (!packageJson) {
          ignoredProjects.push(p);
        } else {
          packageJsonFiles.push(packageJson);
        }
      }
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.PACKAGE_JSON_READ_ERROR };
    }

    // merge all package.json dependencies 
    const mergeResult = mergeDependencies(packageJsonFiles, devDependencies);
    if (!mainPackageJson.dependencies) {
      mainPackageJson.dependencies = {};
    }
    Object.assign(mainPackageJson.dependencies, mergeResult.dependencies);
    if (mergeResult?.devDependencies) {
      if (!mainPackageJson.devDependencies) {
        mainPackageJson.devDependencies = {};
      }
      Object.assign(mainPackageJson.devDependencies, mergeResult.devDependencies);
    }

    // write the merged package.json back to disk
    await this.packageJsonService.writePackageJson(mainPackageJson, projectRoot);

    // TODO: move to its own unit
    if (installOptions && installOptions.install) {
      let args: string[] = [];
      if (installOptions.packageManager === "npm") {
        args = ["install"];
      }
      // install the dependencies
      return {
        success: true,
        payload: {
          ignoredProjects,
          mergedProjects: projects,
          installProcess: spawn(installOptions.packageManager, args, { cwd: projectRoot })
        }
      };
    }

    return {
      success: true,
      payload: {
        ignoredProjects,
        mergedProjects: projects
      }
    };
  }
}
