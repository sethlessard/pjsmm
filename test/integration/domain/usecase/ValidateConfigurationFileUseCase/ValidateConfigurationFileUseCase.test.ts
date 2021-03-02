import { afterEach, beforeEach, suite, test } from "mocha";
import { assert } from "chai";
import * as path from "path";
import { writeFile } from "fs/promises";

import { IntegrationHelper } from "../../../IntegrationHelper";
import { ValidateConfigurationFIleUseCase } from "../../../../../src/domain/usecase/ValidateConfigurationFile/ValidateConfigurationFileUseCase";
import { ErrorResponseEntity } from "../../../../../src/domain/entities/ErrorResponseEntity";
import { ErrorCode } from "../../../../../src/domain/entities/ErrorCode";

suite("domain/usecase/ValidateConfigurationFileUseCase/ValidateConfigurationFileUseCase", () => {

  let testDirectory: string;
  let configPath: string;
  let usecase: ValidateConfigurationFIleUseCase;
  beforeEach(async () => {
    testDirectory = await IntegrationHelper.getTestDirectory();
    usecase = new ValidateConfigurationFIleUseCase();
    configPath = path.join(testDirectory, ".mm.json");
  });
  afterEach(async () => {
    if (testDirectory) {
      await IntegrationHelper.cleanupTestDirectory(testDirectory);
    }
    testDirectory = "";
  });

  test("It should return with an error if there is no configuration file supplied.", async () => {
    usecase.setRequestParam({ configurationFilePath: path.join(testDirectory, ".pjsmm.json") });
    const result = await usecase.execute();
    assert.isFalse(result.success);

    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_NO_FILE, "Wrong errorCode returned!");

    // it should also return an error object (a File IO error)
    assert.isDefined(errorResult.error);
  });

  test("It should return with an error if an empty configuration file is supplied", async () => {
    // write a dummy configuration file
    await writeFile(configPath, "", { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_EMPTY_FILE);
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if no 'version' is supplied", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"projects":[]}`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_NO_VERSION, "Wrong errorCode!");
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if an invalid 'version' is supplied", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"version": "0.0.1", "projects":[]}`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_INVALID_VERSION, "Wrong errorCode!");
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if no 'projects' property is supplied at the root level", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{ "version": "1.0.0" }`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_NO_PROJECTS_PROP, "Wrong errorCode!");
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if an invalid property is supplied at the root level", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"version": "1.0.0", "invalidProp": true, "projects":[]}`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_INVALID_PROPERTY, "Wrong errorCode!");
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if an invalid property is supplied at the 'project' level", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"version": "1.0.0", "projects": [{ "path": "path/to/project", "invalidProp": true }]}`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_INVALID_PROPERTY, "Wrong errorCode!");
    // an error object should not be defined
    assert.isUndefined(errorResult.error);
  });

  test("It should return with an error if malformed JSON is supplied", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"version": "1.0.0"`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isFalse(result.success);
    const errorResult = result as ErrorResponseEntity;
    assert.strictEqual(errorResult.errorCode, ErrorCode.CONFIG_BAD_JSON, "Wrong errorCode!");
    // an error object (File IO error) should be defined
    assert.isDefined(errorResult.error);
  });

  test("It should successfully validate a valid configuration file", async () => {
    // write a dummy configuration file
    await writeFile(configPath, `{"version": "1.0.0", "projects": [{ "rootDir": "path/to/project" }]}`, { encoding: "utf-8" });

    usecase.setRequestParam({ configurationFilePath: configPath });
    const result = await usecase.execute();
    assert.isTrue(result.success);
  });
});
