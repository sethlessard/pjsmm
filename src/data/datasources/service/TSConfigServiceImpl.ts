import { join } from "path";
import { access, readFile } from "fs/promises";
import { constants } from "fs";

import { TSConfigService } from "../../../domain/datasources/services/TSConfigService";

// TODO: test
export class TSConfigServiceImpl implements TSConfigService {

    /**
     * Check to see if there is tsconfig.json file at the root of the
     * specified project.
     * @param rootDir the root directory of the typescript project.
     * @returns true if there is a tsconfig.json file, false if not.
     */
    isThereATSConfig(rootDir: string): Promise<boolean> {
        const tsconfigPath = join(rootDir, "tsconfig.json");
        // check if the tsconfig.json exists and if we can read/write to it.
        return access(tsconfigPath, constants.F_OK | constants.R_OK | constants.W_OK)
            .then(() => readFile(tsconfigPath, { encoding: "utf-8" }))
            .then(fileContents => {
                if (!fileContents || fileContents.length === 0) {
                    return false;
                }
                // verify it's parseable json
                JSON.parse(fileContents);
                return true;
            })
            .catch(_ => false);
    }
}