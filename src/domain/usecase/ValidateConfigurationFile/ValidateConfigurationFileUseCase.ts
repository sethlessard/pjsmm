import { UseCase } from "../UseCase";
import { ValidateConfigurationFileRequestEntity } from "./ValidateConfigurationFileRequestEntity";
import { ValidateConfigurationFileResponseEntity } from "./ValidateConfigurationFileResponseEntity";
import { ErrorCode } from "../../entities/ErrorCode";
import { ConfigurationFileEntity } from "../../entities/ConfigurationFileEntity";
import { ErrorResponseEntity } from "../../entities/ErrorResponseEntity";
import { areThereExcessProperties } from "./helpers/areThereExcessProperties";
import { areThereExcessProjectProperties } from "./helpers/areThereExcessProjectProperties";
import { ConfigurationService } from "../../datasources/services/ConfigurationService";
import { inject, injectable } from "tsyringe";

@injectable()
class ValidateConfigurationFileUseCase
  extends UseCase<ValidateConfigurationFileRequestEntity, ValidateConfigurationFileResponseEntity> {

  /**
   * Create a new ValidateConfigurationFileUseCase instance.
   * @param configurationService the Configuration service.
   */
  constructor(@inject("ConfigurationService") private readonly configurationService: ConfigurationService) {
    super();
  }

  /**
   * Validate a configuration file.
   */
  protected async usecaseLogic(): Promise<ValidateConfigurationFileResponseEntity | ErrorResponseEntity> {
    const { configurationFilePath } = this._param;

    let configuration: ConfigurationFileEntity | undefined;
    try {
      configuration = await this.configurationService.readConfigurationFile(configurationFilePath)
      if (!configuration) {
        return { success: false, errorCode: ErrorCode.CONFIG_EMPTY_FILE };
      }
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_NO_FILE };
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

export { ValidateConfigurationFileUseCase };
