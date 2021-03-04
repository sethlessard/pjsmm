import { PartialPackageJsonEntity } from "../../entities/PartialPackageJsonEntity";

export interface PackageJsonService {
    
    /**
     * Read a package.json file.
     * @param rootDir the path to the root directory of the subproject.
     * @returns the package.json file or undefined if it could not be read.
     * @throws an error if there is a file access error.
     */
    readPackageJson(rootDir: string): Promise<PartialPackageJsonEntity | undefined>;
}
