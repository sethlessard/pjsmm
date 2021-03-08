/* eslint-disable @typescript-eslint/no-var-requires */
import "reflect-metadata";

import { container } from "tsyringe";
const chalk = require("chalk");
const yargs = require("yargs/yargs");

import { PackageJsonServiceImpl } from "../data/datasources/service/PackageJsonServiceImpl";
import { TSConfigServiceImpl } from "../data/datasources/service/TSConfigServiceImpl";
import { ConfigurationServiceImpl } from "../data/datasources/service/ConfigurationServiceImpl";
import { ErrorCode } from "../domain/entities/ErrorCode";
import { ErrorResponseEntity } from "../domain/entities/ErrorResponseEntity";
import { ValidateConfigurationFileUseCase } from "../domain/usecase/ValidateConfigurationFile/ValidateConfigurationFileUseCase";
import { Arguments, MergeArguments, ValidateArguments } from "./Arguments";
import { MergeDependenciesUseCase } from "../domain/usecase/MergeDependencies/MergeDependenciesUseCase";

// setup dependency injection
container.register("ConfigurationService", { useClass: ConfigurationServiceImpl });
container.register("PackageJsonService", { useClass: PackageJsonServiceImpl });
container.register("TSConfigService", { useClass: TSConfigServiceImpl });

// create the yargs instance
const yargsInstance = yargs(process.argv.slice(2))
  .command("validate", "Validate a configuration file")
  .command("merge", "Merge the dependencies of one or more subprojects (TypeScript project references) into a single top-level package.json file", {
    install: { type: "boolean", alias: "i", default: false, description: "Install node dependencies after merging the typescript submodules." },
    skipDev: { type: "boolean", default: false, description: "If true, development dependencies will not be merged." },
    packageManager: { type: "string", default: "yarn", description: "The node_modules package manager to use for dependency installation.", choices: ["yarn", "npm"] }
  })
  .options({
    configFile: { type: "string", alias: ["config", "c"], description: "The path to the tsprm config file (.mm.json)" }
  })
  .demandCommand(1, "Specify a command. -h for help.");

/**
 * The main entrypoint.
 * @param args the command line arguments.
 */
async function main(args: Arguments): Promise<void> {
  const [command] = args._;

  switch (command) {
  case "merge": {
    args = args as MergeArguments;
    const mergeDependenciesUseCase = container.resolve(MergeDependenciesUseCase);
    mergeDependenciesUseCase.setRequestParam({ configFilePath: args.configFile, devDependencies: !args.skipDev, installOptions: { install: args.install, packageManager: args.packageManager ?? "yarn" } });

    try {
      const response = await mergeDependenciesUseCase.execute();
      if (!response.success) {
        handleUseCaseError(response);
        return;
      }

      // output ignored projects
      if (response.payload.ignoredProjects.length > 0) {
        console.log(chalk.brightYellow("Ignored projects:"));
        response.payload.ignoredProjects.forEach(p => console.log(chalk.yellow(p.rootDir)));
      }

      // output merged projects
      if (response.payload.mergedProjects.length > 0) {
        console.log(chalk.green("Merged projects:"));
        response.payload.mergedProjects.forEach(p => console.log(chalk.green(p.rootDir)));
      }

      if (response.payload.installProcess) {
        console.log();
        console.log("Installing dependencies...");
        response.payload.installProcess.stdout?.on("data", (data: Buffer) => console.log(data.toString("utf-8").trim()));
        response.payload.installProcess.stderr?.on("data", (data: Buffer) => console.log(data.toString("utf-8").trim()));

        response.payload.installProcess.on("error", (err) => console.log(`[ERROR] ${err}`));
        response.payload.installProcess.on("close", (result: number) => {
          if (result === 0 || result === null) {
            console.log(chalk.green("Done."));
          } else {
            console.log(`Ruh roh! The install process exited with code '${result}'`);
            process.exit(result);
          }
        });
      } else {
        console.log(chalk.green("Done."));
      }
    } catch (error) {
      handleUseCaseError({ success: false, error, errorCode: ErrorCode.GENERAL });
      return;
    }
    break;
  }
  case "validate": {
    args = args as ValidateArguments;
    const validateConfigFileUseCase = container.resolve(ValidateConfigurationFileUseCase);
    validateConfigFileUseCase.setRequestParam({ configurationFilePath: args.configFile });

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
    writeError("Config Error: Invalid 'version' property! Valid values are '1.0.0'.");
    break;
  case ErrorCode.CONFIG_READ_ERROR:
    writeError("Could not read the '.mm.json' configuration file!: " + response.error);
    break;
  case ErrorCode.CONFIG_NO_VERSION:
    writeError("Config Error: No 'version' property!'");
    break;
  case ErrorCode.CONFIG_INVALID_PROPERTY:
    writeError("Config Error: There is an invalid property in the config file. Please reference the documentation for a correct config file layout.");
    break;
  case ErrorCode.CONFIG_NO_PROJECTS:
    writeError("Config Error: No subprojects specified in the 'projects' property!");
    break;
  case ErrorCode.CONFIG_NO_PROJECTS_PROP:
    writeError("Config Error: No 'projects' property!");
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
    writeError("Unimplemented error code!: " + response.errorCode ?? "");
    if (response.error) {
      writeError(response.error.message);
    }
    break;
  }
}

/**
 * Write an error message.
 * @param message the error to write.
 */
function writeError(message: string): void {
  console.error(chalk.red(`Error: ${message}`));
}

/**
 * Read the program command line arguments.
 */
function readArugments(): Arguments {
  return (yargsInstance.argv as unknown) as Arguments;
}

// run the program 
main(readArugments());
