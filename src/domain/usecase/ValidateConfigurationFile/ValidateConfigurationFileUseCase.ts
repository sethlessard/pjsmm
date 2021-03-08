import { inject, injectable } from "tsyringe";
import { join } from "path";

import { UseCase } from "../UseCase";
import { ValidateConfigurationFileRequestEntity } from "./ValidateConfigurationFileRequestEntity";
import { ValidateConfigurationFileResponseEntity } from "./ValidateConfigurationFileResponseEntity";
import { ErrorCode } from "../../entities/ErrorCode";
import { ConfigurationFileEntity } from "../../entities/ConfigurationFileEntity";
import { ErrorResponseEntity } from "../../entities/ErrorResponseEntity";
import { ConfigurationService } from "../../datasources/services/ConfigurationService";
import { ConfigurationFileValidator } from "../../entities/validators/ConfigurationFileValidator";

@injectable()
class ValidateConfigurationFileUseCase
  extends UseCase<ValidateConfigurationFileRequestEntity, ValidateConfigurationFileResponseEntity> {

  private static readonly DEFAULT_CONFIG_PATH = join(process.cwd(), ".tsprm.json");

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
    let { configurationFilePath } = this._param;

    if (!configurationFilePath) {
      configurationFilePath = ValidateConfigurationFileUseCase.DEFAULT_CONFIG_PATH;
    }

    let configuration: ConfigurationFileEntity | undefined;
    try {
      configuration = await this.configurationService.readConfigurationFile(configurationFilePath);
      if (!configuration) {
        return { success: false, errorCode: ErrorCode.CONFIG_EMPTY_FILE };
      }
    } catch (error) {
      return { success: false, error, errorCode: ErrorCode.CONFIG_READ_ERROR };
    }

    // validate the file
    const validationError = ConfigurationFileValidator.validate(configuration);
    if (validationError) {
      return { success: false, errorCode: validationError };
    }

    return { success: true, payload: undefined };
  }
}

export { ValidateConfigurationFileUseCase };
