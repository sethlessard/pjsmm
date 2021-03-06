import { constants } from "fs";
import { access, readFile, writeFile } from "fs/promises";
import { join } from "path";

import { PackageJsonService } from "../../../domain/datasources/services/PackageJsonService";
import { PartialPackageJsonEntity } from "../../../domain/entities/PartialPackageJsonEntity";

// TODO: test
export class PackageJsonServiceImpl implements PackageJsonService {

  /**
     * Read a package.json file.
     * @param rootDir the path to the root directory of the subproject.
     * @returns the package.json file or undefined if it is not found.
     * @throws if there is a file access error.
     */
  readPackageJson(rootDir: string): Promise<PartialPackageJsonEntity | undefined> {
    const packageJsonPath = this._getPackageJsonPath(rootDir);
    return access(packageJsonPath, constants.F_OK | constants.R_OK | constants.W_OK)
      .then(() => readFile(packageJsonPath, { encoding: "utf-8" }))
      .then(fileContents => {
        if (!fileContents || fileContents.length === 0) {
          return undefined;
        }
        return JSON.parse(fileContents) as PartialPackageJsonEntity;
      });
  }

  /**
     * Write a package.json file to disk.
     * @param packageJson the package.json file to write.
     * @param rootDir the path to the root directory of a node project.
     */
  writePackageJson(packageJson: PartialPackageJsonEntity, rootDir: string): Promise<void> {
    return writeFile(this._getPackageJsonPath(rootDir), JSON.stringify(packageJson, undefined, 4), { encoding: "utf-8" });
  }

  /**
     * 
     * @param rootDir the path to the root directory of a node projet.
     */
  private _getPackageJsonPath(rootDir: string): string {
    return join(rootDir, "package.json");
  }
}