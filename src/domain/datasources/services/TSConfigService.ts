export interface TSConfigService {
    
    /**
     * Verify that there is a tsconfig.json file in the 
     * subproject's root directory.
     * @param rootDir the root directory.
     * @returns true if there is a tsconfig.json file,
     *          false if not.
     */
    isThereATSConfig(rootDir: string): Promise<boolean>;
}
