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
   * @param silent if true, no console output will occur.
   */
  static cleanupTestDirectory(directory: string, silent: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      rimraf(directory, (error: Error) => {
        if (error) {
          reject(error);
        } else {
          if (!silent) {
            console.log(`Cleaned test directory: "${directory}"`);
          }
          resolve();
        }
      });
    });
  }

  /**
   * Create a test configuration file object.
   * @param projects the projects to include
   */
  static createConfig(projects: string[] = []): ConfigurationFileEntity {
    return {
      version: "1.0.0",
      projects: projects.map(p => ({ rootDir: p }))
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
   * @param silent if set, no console output will occur.
   */
  static getTestDirectory(silent: boolean): Promise<string> {
    const directory = join(tmpdir(), "package-json-submodule-merge-tests", uuid());
    return mkdir(directory, { recursive: true })
      .then(() => {
        if (!silent) {
          console.log(`Created test directory: "${directory}"`);
        }
        return directory;
      });
  }
}