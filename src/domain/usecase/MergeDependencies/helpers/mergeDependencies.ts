import * as _ from "lodash";

import { Dependency, PartialPackageJsonEntity } from "../../../entities/PartialPackageJsonEntity";

// TODO: provide a "dependency merge strategy" when multiple dependency definitions exist
/**
 * Merge some dependency arrays, keeping the latest version if there are
 * any dependency clashes.
 * @param allDependencies the dependency arrays to merge.
 */
function _mergeDependencies(allDependencies: Dependency[][]): Dependency[] {
    // flatten the dependencies and keep the latest version if there are multiples
    return allDependencies.reduce((accumulator: Dependency[], currentValue: Dependency[]) => {
        return [...accumulator, ...currentValue.filter(d => {
            const depName = Object.keys(d)[0];
            const existingDeps = accumulator.map(ed => Object.keys(ed)[0]);
            if (existingDeps.indexOf(depName) === -1) {
                return true;
            }
            // TODO: else if (version of d > version of existing) { use d }
            return false;
        })]
    });
}

// TODO: test
/**
 * Merge the dependencies
 * @param packages the package.json files.
 * @param mergeDev if true, the devDependencies will be merged as well.
 */
export function mergeDependencies(packages: PartialPackageJsonEntity[], mergeDev: boolean = false): { dependencies: Dependency[], devDependencies: Dependency[] } {
    return { dependencies: _mergeDependencies(packages.map(p => p.dependencies)), devDependencies: (mergeDev) ? _mergeDependencies(packages.map(p => p.devDependencies)) : []}
}
