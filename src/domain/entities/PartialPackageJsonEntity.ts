
/**
 * package.json dependency entry.
 *  { "package": "version" }
 */
export type Dependency = { [name: string]: string };

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
    dependencies: Dependency[];

    /**
     * The development dependencies
     */
    devDependencies: Dependency[];
}
