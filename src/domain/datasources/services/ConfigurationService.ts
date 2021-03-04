import { ConfigurationFileEntity } from "../domain/entities/ConfigurationFileEntity";

export interface ConfigurationService {

  /**
   * Read the configuration file.
   * @param configurationPath the path to the configuraiton file.
   * @returns the configuration file or undefined if none exists.
   */
  readConfigurationFile(configurationPath?: string): Promise<ConfigurationFileEntity | undefined>;
}
