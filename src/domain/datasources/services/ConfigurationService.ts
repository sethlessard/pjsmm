import { ConfigurationFileEntity } from "src/domain/entities/ConfigurationFileEntity";

export interface ConfigurationService {

  /**
   * Read the configuration file.
   * @returns the configuration file or undefined if none exists.
   */
  readConfigurationFile(configurationPath: string): Promise<ConfigurationFileEntity | undefined>;
}
