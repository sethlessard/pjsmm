
export interface InstallOptions {
    
    /**
     * If set, the Node.JS dependencies will be installed.
     */
    install: boolean;

    /**
     * The package manager to use.
     */
    packageManager: "npm" | "yarn";
}


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
     * The node.js dependency installation options.
     */
    installOptions?: InstallOptions;
}
