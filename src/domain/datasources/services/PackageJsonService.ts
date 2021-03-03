import { PartialPackageJsonEntity } from "../../entities/PartialPackageJsonEntity";

export interface PackageJsonService {
    
    /**
     * Read a package.json file.
     * @param rootDir the path to the root directory of the subproject     * @returns the package.json file.
     */
    readPackageJson(rootDir: string): Promise<PartialPackageJsonEntity>;
}
