import { DependencyDefinition, PartialPackageJsonEntity } from "../../../entities/PartialPackageJsonEntity";
import { cleanupVersion } from "./cleanupVersion";
import { compareVersions } from "./compareVersions";

// TODO: provide a "dependency merge strategy" when multiple dependency definitions exist
/**
 * Merge some dependency arrays, keeping the latest version if there are
 * any dependency clashes.
 * @param allDependencies the dependency arrays to merge.
 */
function _mergeDependencies(allDependencies: DependencyDefinition[]): DependencyDefinition {
  // flatten the dependencies and keep the latest version if there are multiples
  const reduced = allDependencies.reduce((accumulator: DependencyDefinition, currentDependency: DependencyDefinition): DependencyDefinition => {
    // read the dependency keys from the current dependency
    if (!currentDependency) {
      return accumulator;
    } 
    const currentDepKeys = Object.keys(currentDependency);
    // read the dependency keys from the accumulator
    const accumDepKeys = Object.keys(accumulator);

    for (const depName of currentDepKeys) {
      if (accumDepKeys.indexOf(depName) === -1) {
        // add the dependency to the accumulator
        accumulator[depName] = currentDependency[depName];
      } else {
        const existingVersion = cleanupVersion(accumulator[depName]);
        const currentDependencyVersion = cleanupVersion(currentDependency[depName]);
        if (compareVersions(existingVersion, currentDependencyVersion) === "v2") {
          // the current dependency version is greater than the version that exists in the accumulator
          accumulator[depName] = currentDependency[depName];
        }
      }
    }
    return accumulator;
  }, {});
    // sort the dependencies
  return Object.keys(reduced).sort().reduce((obj: DependencyDefinition, key: keyof DependencyDefinition) => {
    obj[key] = reduced[key];
    return obj;
  }, {});
}

/**
 * Merge the dependencies
 * @param packages the package.json files.
 * @param mergeDev if true, the devDependencies will be merged as well.
 */
export function mergeDependencies(packages: PartialPackageJsonEntity[], mergeDev = false): { dependencies: DependencyDefinition, devDependencies: DependencyDefinition } {
  return { dependencies: _mergeDependencies(packages.map(p => p.dependencies)), devDependencies: (mergeDev) ? _mergeDependencies(packages.map(p => p.devDependencies)) : {} };
}
