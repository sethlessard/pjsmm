import { DependencyDefinition, PartialPackageJsonEntity } from "../../../entities/PartialPackageJsonEntity";

// TODO: provide a "dependency merge strategy" when multiple dependency definitions exist
/**
 * Merge some dependency arrays, keeping the latest version if there are
 * any dependency clashes.
 * @param allDependencies the dependency arrays to merge.
 */
function _mergeDependencies(allDependencies: DependencyDefinition[]): DependencyDefinition {
    // flatten the dependencies and keep the latest version if there are multiples
    return allDependencies.reduce((accumulator: DependencyDefinition, currentDependency: DependencyDefinition): DependencyDefinition => {
        // read the dependency keys from the current dependency
        const currentDepKeys = Object.keys(currentDependency);
        // read the dependency keys from the accumulator
        const accumDepKeys = Object.keys(accumulator);

        for (const depName of currentDepKeys) {
            if (accumDepKeys.indexOf(depName) === -1) {
                // add the dependency to the accumulator
                accumulator[depName] = currentDependency[depName];
            } else {
                const existingVersion = _cleanupVersion(accumulator[depName]);
                const currentDependencyVersion = _cleanupVersion(currentDependency[depName]);
                if (_compareVersions(existingVersion, currentDependencyVersion) === "v2") {
                    // the current dependency version is greater than the version that exists in the accumulator
                    accumulator[depName] = currentDependency[depName];
                }
            }
        }
        return accumulator;
    }, {});
}

// TODO: break out to own file
/**
 * Cleanup a version string. (Removes '~' or '^')
 * @param version the version string.
 * @returns the cleaned string.
 */
function _cleanupVersion(version: string): string {
    return version
        .replace("^", "")
        .replace("~", "");
}

// TODO: break out to own file
/**
 * Compare two npm versions.
 * @param v1 the first version to compare.
 * @param v2 the second version to compare.
 * @returns "v1" if the first version is greater
 * @returns "v2" if the second version is greater.
 * @returns "eq" if the versions are equal
 */
function _compareVersions(v1: string, v2: string): "v1" | "eq" | "v2" {
    const v1Split = v1.split(".").map(vt => parseInt(vt, 10));
    const v2Split = v2.split(".").map(vt => parseInt(vt, 10));

    // assuming the supplied versions are correct npm versions
    for (let i = 0; i < v1Split.length; i++) {
        if (v1Split[i] > v2Split[i]) {
            return "v1";
        } else if (v2Split[i] > v1Split[i]) {
            return "v2";
        }
    }
    return "eq";
}

// TODO: test
/**
 * Merge the dependencies
 * @param packages the package.json files.
 * @param mergeDev if true, the devDependencies will be merged as well.
 */
export function mergeDependencies(packages: PartialPackageJsonEntity[], mergeDev: boolean = false): { dependencies: DependencyDefinition, devDependencies: DependencyDefinition } {
    return { dependencies: _mergeDependencies(packages.map(p => p.dependencies)), devDependencies: (mergeDev) ? _mergeDependencies(packages.map(p => p.devDependencies)) : {} }
}
