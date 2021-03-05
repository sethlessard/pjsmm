import { join } from "path";
import { readFile } from "fs/promises";

import { ConfigurationService } from "../../../domain/datasources/services/ConfigurationService";
import { ConfigurationFileEntity } from "../../../domain/entities/ConfigurationFileEntity";

const DEFAULT_CONFIG_PATH = join(process.cwd(), ".mm.json");

// TODO: test
export class ConfigurationServiceImpl implements ConfigurationService {

    /**
     * Read the configuration file.
     * If a configuration path is not supplied, the the configuration file will be expected
     * to live at $PWD/.mm.json
     * @param configurationPath the path to the configuration file.
     * @returns the configuration file or undefined if one is not found at the specified path.
     */
    readConfigurationFile(configurationPath?: string): Promise<ConfigurationFileEntity | undefined> {
        if (!configurationPath) {
            configurationPath = DEFAULT_CONFIG_PATH;
        }
        return readFile(configurationPath, { encoding: "utf-8" })
            .then(fileContents => {
                if (!fileContents) {
                    return undefined;
                }
                const config: ConfigurationFileEntity = JSON.parse(fileContents);
                config.filePath = configurationPath!;
                return config;
            });
    }
}
