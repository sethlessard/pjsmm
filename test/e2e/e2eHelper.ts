import { dirname } from "path";

export class e2eHelper {

  /**
   * Get the project root. 
   * @returns the project root.
   */
  static getProjectRoot(): string {
    return dirname( // root/
      dirname(      // root/test/
        __dirname   // root/test/e2e
      )
    );
  }
}
