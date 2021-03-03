import "regenerator-runtime/runtime";

// read the arguments
const chalk = require("chalk");
import { ConfigurationServiceImpl } from "../data/datasources/service/ConfigurationServiceImpl";
import { ErrorCode } from "../domain/entities/ErrorCode";
import { ErrorResponseEntity } from "../domain/entities/ErrorResponseEntity";
import { ValidateConfigurationFileUseCase } from "../domain/usecase/ValidateConfigurationFile/ValidateConfigurationFileUseCase";
const yargs = require("yargs/yargs");
import { Arguments } from "./Arguments";

// create the yargs instance
const yargsInstance = yargs(process.argv.slice(2))
  .options({
    i: { type: "boolean", default: false, description: "Install node dependencies after merging the typescript submodules." },
    skipDev: { type: "boolean", default: false, description: "If true, development dependencies will not be merged." },
    packageManager: { type: "string", default: "yarn", description: "The node_modules package manager to use for dependency installation.", choices: ["yarn", "npm"] }
  });

/**
 * Main.
 * @param args the command line arguments.
 */
async function main(args: Arguments) {
  const [command, configFilePath] = args._;

  switch (command) {
    case "merge":
      console.log(chalk.redBright("Not implemented!"));
      break;
    case "validate": {
      const validateConfigFileUseCase = new ValidateConfigurationFileUseCase(new ConfigurationServiceImpl());
      validateConfigFileUseCase.setRequestParam({ configurationFilePath: configFilePath });

      try {
        const response = await validateConfigFileUseCase.execute();
        if (!response.success) {
          handleUseCaseError(response);
          return;
        }

        console.log(chalk.green("The configuration file is valid!"));
      } catch (error) {
        handleUseCaseError({ success: false, errorCode: ErrorCode.GENERAL, error });
      }
      break;
    }
    case undefined:
      yargsInstance.showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      yargsInstance.showHelp();
      break;
  }
}

/**
 * Handle a use case error.
 * @param response the error response.
 */
function handleUseCaseError(response: ErrorResponseEntity) {
  switch (response.errorCode) {
    // configuration file 
    case ErrorCode.CONFIG_INVALID_VERSION:
      writeError("Config. Error: Invalid 'version' property! Valid values are '1.0.0'.")
      break;
    case ErrorCode.CONFIG_NO_FILE:
      writeError("Unable to load the coniguration file!");
      break;
    case ErrorCode.CONFIG_NO_VERSION:
      writeError("Config. Error: No 'version' property!'")
      break;
    // general
    case ErrorCode.GENERAL:
      if (response.error) {
        writeError(response.error?.message);
      } else {
        writeError("An error occurred.");
      }
      break;
    default:
      writeError("Implement the case you idiot.");
  }
}

/**
 * Write an error message.
 * @param message the error to write.
 */
function writeError(message: string): void {
  console.error(chalk.yellowBright(message));
}

/**
 * Read the program command line arguments.
 */
function readArugments(): Arguments {
  return (yargsInstance.argv as unknown) as Arguments;
}

main(readArugments());


