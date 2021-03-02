import { Arguments as YArguments } from "yargs";

export type Command = "merge" | "validate";

export interface Arguments extends YArguments {

  /**
   * Install flag. If set, the dependencies will be installed 
   * in the main project.
   */
  i: boolean;

  /**
   * The positional arguments
   */
  _: [command: Command, configurationFile: string];
}
