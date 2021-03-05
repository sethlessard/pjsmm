import { tmpdir } from "os";
import { join } from "path";
import { mkdir } from "fs/promises";
import { v4 as uuid } from "uuid";
import rimraf from "rimraf";
import { ConfigurationFileEntity } from "../../src/domain/entities/ConfigurationFileEntity";

export class IntegrationHelper {

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
    })
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