export interface MergeDependenciesRequestEntity {

    /**
     * The path to the configuration file.
     */
    configFilePath?: string;

    /**
     * Whether or not to merge the development dependencies into the
     * upper-level package.json file.
     */
    devDependencies: boolean;

    /**
     * If set, the Node.JS dependencies will be installed.
     */
    install: boolean;
}
