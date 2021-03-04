import { Dependency, PartialPackageJsonEntity } from "../domain/entities/PartialPackageJsonEntity";

// TODO: test
/**
 * Merge the dependencies
 * @param packages the package.json files.
 * @param mergeDev if true, the devDependencies will be merged as well.
 */
export function mergeDependencies(packages: PartialPackageJsonEntity[], mergeDev: boolean = false): Dependency[] {
    // TODO: complete
}