import { dirname } from "path";

import { ConfigurationService } from "src/domain/datasources/services/ConfigurationService";
import { PackageJsonService } from "src/domain/datasources/services/PackageJsonService";
import { TSConfigService } from "src/domain/datasources/TSConfigService";
import { ConfigurationFileEntity } from "src/domain/entities/ConfigurationFileEntity";
import { ErrorCode } from "src/domain/entities/ErrorCode";
import { ErrorResponseEntity } from "src/domain/entities/ErrorResponseEntity";
import { ProjectEntity } from "src/domain/entities/ProjectEntity";
import { UseCase } from "../UseCase";
import { ValidateConfigurationFileUseCase } from "../ValidateConfigurationFile/ValidateConfigurationFileUseCase";
import { MergeDependenciesRequestEntity } from "./MergeDependenciesRequestEntity";

export class MergeDependenciesUseCase extends UseCase<MergeDependenciesRequestEntity, undefined> {

  /**
   * Create a new MergeDependenciesUseCase instance.
   * @param configurationService the configuration service.
   * @param packageJsonService the package.json service.
   * @param tsconfigService the tsconfig.json service.
   */
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly packageJsonService: PackageJsonService,
    private readonly tsconfigService: TSConfigService
  ) {
    super();
  }

  /**
   * Merge the dependencies of two or more package.josn files from typescript subprojects
   * into a single package.json.
   */
  protected async usecaseLogic(): Promise<ErrorResponseEntity | undefined> {
    const { configFilePath } = this._param;

    // validate the config file
    const validateUseCase = new ValidateConfigurationFileUseCase(this.configurationService);
    validateUseCase.setRequestParam({ configurationFilePath: configFilePath });
    const result = await validateUseCase.execute();
    if (!result.success) {
      return result;
    }

    // read the configuration
    let configuration: ConfigurationFileEntity | undefined;
    try {
      configuration = await this.configurationService.readConfigurationFile(configFilePath);
      if (!configuration) {
        return { success: false, errorCode: ErrorCode.CONFIG_EMPTY_FILE };
      }
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_NO_FILE };
    }

    // verify there is a package.json at the same level of the configuation
    const projectRoot: string = dirname(configuration.filePath);
    const appjson = await this.packageJsonService.readPackageJson(projectRoot);
    if (!appjson) {
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
        if (await this.tsconfigService.isThereATSConfig(p.rootDir)) {
          filtered.push(p);
        } else {
          ignoredProjects.push(p);
        }
      }
      return filtered;
    };

    const projects = await filterProjects(configuration.projects);

    // read the package.json files
    const packageJsonFiles = await Promise.all(projects.map(({ rootDir }) => this.packageJsonService.readPackageJson(rootDir)));

    // merge the dependencies into the main package.json file
    // TODO: complete
    // TODO: test
  }
}
