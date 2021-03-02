import { UseCase } from "../UseCase";
import { ValidateConfigurationFileRequestEntity } from "./ValidateConfigurationFileRequestEntity";
import { ValidateConfigurationFileResponseEntity } from "./ValidateConfigurationFileResponseEntity";
import { readFile } from "fs/promises";
import { ErrorCode } from "../../entities/ErrorCode";
import { ConfigurationFileEntity } from "../../entities/ConfigurationFileEntity";
import { ErrorResponseEntity } from "../../entities/ErrorResponseEntity";
import { areThereExcessProperties } from "./helpers/areThereExcessProperties";
import { areThereExcessProjectProperties } from "./helpers/areThereExcessProjectProperties";
import { ConfigurationService } from "src/domain/datasources/services/ConfigurationService";

export class ValidateConfigurationFileUseCase
  extends UseCase<ValidateConfigurationFileRequestEntity, ValidateConfigurationFileResponseEntity> {
  
  /**
   * Create a new ValidateConfigurationFileUseCase instance.
   * @param configurationService the Configuration service.
   */
  constructor(private readonly configurationService: ConfigurationService) {
    super();
  }
  
  /**
   * Validate a configuration file.
   */
  protected async usecaseLogic(): Promise<ValidateConfigurationFileResponseEntity | ErrorResponseEntity> {
    const { configurationFilePath } = this._param;
    // TODO: move this code to data-layer ConfigurationServiceImpl.ts
    // read the file
    let configurationFileRaw: string;
    try {
      configurationFileRaw = await readFile(configurationFilePath, { encoding: "utf-8" });
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_NO_FILE };
    }

    // check to see if the file is empty
    if (!configurationFileRaw) {
      return { success: false, errorCode: ErrorCode.CONFIG_EMPTY_FILE };
    }

    let configuration: ConfigurationFileEntity;
    try {
      configuration = JSON.parse(configurationFileRaw);
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_BAD_JSON };
    }

    // there must be a version
    if (!configuration.version) {
      return { success: false, errorCode: ErrorCode.CONFIG_NO_VERSION };
    }
    // the version must be "1.0.0"
    if (configuration.version !== "1.0.0") {
      return { success: false, errorCode: ErrorCode.CONFIG_INVALID_VERSION };
    }
    if (!configuration.projects) {
      return { success: false, errorCode: ErrorCode.CONFIG_NO_PROJECTS_PROP }
    }
    if (areThereExcessProjectProperties(configuration.projects)) {
      return { success: false, errorCode: ErrorCode.CONFIG_INVALID_PROPERTY };
    }

    // check to see if there are excess properties at the root level
    if (areThereExcessProperties(configuration)) {
      return { success: false, errorCode: ErrorCode.CONFIG_INVALID_PROPERTY };
    }

    return { success: true, payload: undefined };
  }
}
