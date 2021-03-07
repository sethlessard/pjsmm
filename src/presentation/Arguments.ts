import { Arguments as YArguments } from "yargs";

export type Command = "merge" | "validate";

interface PJSMMArguments extends YArguments {

  /**
   * The positional arguments
   */
  _: [command: Command];
}

interface HasConfigFile {

  /**
   * The path to the configuration file.
   */
  configFile: string;
}

export interface MergeArguments extends PJSMMArguments, HasConfigFile {

  /**
   * Install flag. If set, the dependencies will be installed 
   * in the main project.
   */
  install: boolean;

  /**
   * If true, development dependencies will be skipped.
   */
  skipDev: boolean;

  /**
   * The package manager to use for dependency installation.
   */
  packageManager: "yarn" | "npm";

  /**
   * The positional arguments
   */
  _: ["merge"];
}

export interface ValidateArguments extends PJSMMArguments, HasConfigFile {

  /**
   * The positional arguments
   */
  _: ["validate"];
}

export type Arguments = MergeArguments | ValidateArguments;