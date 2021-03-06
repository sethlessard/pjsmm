import { tmpdir } from "os";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import rimraf from "rimraf";
import { ConfigurationFileEntity } from "../../src/domain/entities/ConfigurationFileEntity";

export class IntegrationHelper {

  static readonly DUMMY_TSCONFIG = {
    compilerOptions: {
      module: "commonjs",
      noImplicitAny: true,
      sourceMap: true
    }
  };

  /**
   * Cleanup a test directory.
   * @param directory the test directory.
   */
  static cleanupTestDirectory(directory: string): Promise<void> {
    return new Promise((resolve, reject) => {
      rimraf(directory, (error: Error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`Cleaned test directory: "${directory}"`);
          resolve();
        }
      });
    });
  }

  /**
   * Create a test configuration file object.
   * @param projects the projects to include
   * @param testExtensionDirectory the directory of the test extension.
   */
  static createConfig(projects: string[] = [], testExtensionDirectory: string): ConfigurationFileEntity {
    return {
      version: "1.0.0",
      projects: projects.map(p => ({ rootDir: p })),
      filePath: join(testExtensionDirectory, ".mm.json")
    };
  }

  /**
   * Create a dummy tsconfig.json file and place it in the specified root directory.
   * @param rootDir the root directory to place the tsconfig.json file.
   */
  static createDummyTSConfig(rootDir: string): Promise<void> {
    return writeFile(join(rootDir, "tsconfig.json"), JSON.stringify(IntegrationHelper.DUMMY_TSCONFIG), { encoding: "utf-8" });
  }

  /**
   * Get a directory on the local filesystem that can be used for testing.
   */
  static getTestDirectory(): Promise<string> {
    const directory = join(tmpdir(), "package-json-submodule-merge-tests", uuid());
    return mkdir(directory, { recursive: true })
      .then(() => {
        console.log(`Created test directory: "${directory}"`);
        return directory;
      });
  }
}