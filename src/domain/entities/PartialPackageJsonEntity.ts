
/**
 * package.json dependency entry.
 *  { "package": "version" }
 */
export type DependencyDefinition = { [name: string]: string };

export interface PartialPackageJsonEntity {

    /**
     * The npm package name.
     */
    name: string;

    /**
     * The version.
     */
    version: string;

    /**
     * The dependencies
     */
    dependencies: DependencyDefinition;

    /**
     * The development dependencies
     */
    devDependencies: DependencyDefinition;
}
