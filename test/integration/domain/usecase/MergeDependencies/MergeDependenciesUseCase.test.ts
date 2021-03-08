import "reflect-metadata";
import { afterEach, beforeEach, suite, test } from "mocha";
import { assert } from "chai";
import * as path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

import { IntegrationHelper } from "../../../IntegrationHelper";
import { MergeDependenciesUseCase } from "../../../../../src/domain/usecase/MergeDependencies/MergeDependenciesUseCase";
import { ConfigurationServiceImpl } from "../../../../../src/data/datasources/service/ConfigurationServiceImpl";
import { PackageJsonServiceImpl } from "../../../../../src/data/datasources/service/PackageJsonServiceImpl";
import { TSConfigServiceImpl } from "../../../../../src/data/datasources/service/TSConfigServiceImpl";
import { ErrorResponseEntity } from "../../../../../src/domain/entities/ErrorResponseEntity";
import { MergeDependenciesResponseEntity } from "../../../../../src/domain/usecase/MergeDependencies/MergeDependenciesResponseEntity";

const PJ_1 = {
  name: "package-1",
  version: "1.0.0",
  author: "Tim",
  license: "MIT",
  dependencies: {
    boxen: "5.0.0",
    uuid: "8.3.2"
  },
  devDependencies: {
    chai: "4.3.0",
    mocha: "4.0.0",
    rimraf: "3.0.0"
  }
};
const PJ_2 = {
  name: "package-2",
  version: "1.0.0",
  author: "Tim",
  license: "MIT",
  dependencies: {
    yargs: "16.2.0"
  },
  devDependencies: {
    rimraf: "3.0.2"
  }
};
const PJ_MAIN = {
  name: "main",
  version: "1.0.0",
  author: "Tim",
  license: "MIT"
};

suite("domain/usecase/MergeDependencies/MergeDependenciesUseCase", () => {

  let testDirectory: string;
  let usecase: MergeDependenciesUseCase;
  beforeEach(async () => {
    testDirectory = await IntegrationHelper.getTestDirectory(true);
    const configurationService = new ConfigurationServiceImpl();
    const packageJsonService = new PackageJsonServiceImpl();
    const tsConfigService = new TSConfigServiceImpl();
    usecase = new MergeDependenciesUseCase(configurationService, packageJsonService, tsConfigService);
  });
  afterEach(async () => {
    if (testDirectory) {
      await IntegrationHelper.cleanupTestDirectory(testDirectory, true);
    }
    testDirectory = "";
  });

  test("It should be able to merge multiple subproject package.json dependencies.", async () => {
    // write the test app.json files
    const package1Path = path.join(testDirectory, "package1");
    const package1PackageJsonPath = path.join(package1Path, "package.json");
    const package2Path = path.join(testDirectory, "package2");
    const package2PackageJsonPath = path.join(package2Path, "package.json");
    await mkdir(package1Path);
    await mkdir(package2Path);
    await IntegrationHelper.createDummyTSConfig(package1Path);
    await IntegrationHelper.createDummyTSConfig(package2Path);
    await writeFile(package1PackageJsonPath, JSON.stringify(PJ_1), { encoding: "utf-8" });
    await writeFile(package2PackageJsonPath, JSON.stringify(PJ_2), { encoding: "utf-8" });

    // write the main project configuration file to use
    const configFilePath = path.join(testDirectory, ".tsprm.json");
    await writeFile(configFilePath, JSON.stringify(IntegrationHelper.createConfig(["package1", "package2"])), { encoding: "utf-8" });

    // write the main project package.json
    const mainPackageJsonPath = path.join(testDirectory, "package.json");
    await writeFile(mainPackageJsonPath, JSON.stringify(PJ_MAIN), { encoding: "utf-8" });

    const expectedDependencies = {
      boxen: "5.0.0",
      uuid: "8.3.2",
      yargs: "16.2.0"
    };

    // execute the usecase
    usecase.setRequestParam({ configFilePath, installOptions: { install: false, packageManager: "yarn" }, devDependencies: false });
    let response = await usecase.execute();
    assert.isTrue(response.success, `The usecase failed!: ${(response as ErrorResponseEntity).errorCode}`);
    response = response as MergeDependenciesResponseEntity;
    assert.strictEqual(response.payload.ignoredProjects.length, 0, "Projects were ignored!");

    // verify the dependencies were merged into the main package.json file
    const mainPackageJsonRaw = await readFile(mainPackageJsonPath, { encoding: "utf-8" });
    assert.isDefined(mainPackageJsonRaw, "Empty main package.json!");
    assert.isNotEmpty(mainPackageJsonRaw, "Empty main package.json!");

    const mainPackageJson = JSON.parse(mainPackageJsonRaw);
    assert.isDefined(mainPackageJson.dependencies, "No dependencies!");
    assert.isNotEmpty(mainPackageJson.dependencies, "No dependencies!");
    assert.deepStrictEqual(mainPackageJson.dependencies, expectedDependencies, "Wrong dependencies in the main package.json!");
  });

  test("It should be able to merge multiple subproject package.json development dependencies.", async () => {
    // write the test app.json files
    const package1Path = path.join(testDirectory, "package1");
    const package1PackageJsonPath = path.join(package1Path, "package.json");
    const package2Path = path.join(testDirectory, "package2");
    const package2PackageJsonPath = path.join(package2Path, "package.json");
    await mkdir(package1Path);
    await mkdir(package2Path);
    await IntegrationHelper.createDummyTSConfig(package1Path);
    await IntegrationHelper.createDummyTSConfig(package2Path);
    await writeFile(package1PackageJsonPath, JSON.stringify(PJ_1), { encoding: "utf-8" });
    await writeFile(package2PackageJsonPath, JSON.stringify(PJ_2), { encoding: "utf-8" });

    // write the main project configuration file to use
    const configFilePath = path.join(testDirectory, ".tsprm.json");
    await writeFile(configFilePath, JSON.stringify(IntegrationHelper.createConfig(["package1", "package2"])), { encoding: "utf-8" });

    // write the main project package.json
    const mainPackageJsonPath = path.join(testDirectory, "package.json");
    await writeFile(mainPackageJsonPath, JSON.stringify(PJ_MAIN), { encoding: "utf-8" });

    const expectedDependencies = {
      chai: "4.3.0",
      mocha: "4.0.0",
      rimraf: "3.0.2"
    };

    // execute the usecase
    usecase.setRequestParam({ configFilePath, installOptions: { install: false, packageManager: "yarn" }, devDependencies: true });
    let response = await usecase.execute();
    assert.isTrue(response.success, `The usecase failed!: ${(response as ErrorResponseEntity).errorCode}`);
    response = response as MergeDependenciesResponseEntity;
    assert.strictEqual(response.payload.ignoredProjects.length, 0, "Projects were ignored!");

    // verify the dependencies were merged into the main package.json file
    const mainPackageJsonRaw = await readFile(mainPackageJsonPath, { encoding: "utf-8" });
    assert.isDefined(mainPackageJsonRaw, "Empty main package.json!");
    assert.isNotEmpty(mainPackageJsonRaw, "Empty main package.json!");

    const mainPackageJson = JSON.parse(mainPackageJsonRaw);
    assert.isDefined(mainPackageJson.devDependencies, "No development dependencies!");
    assert.isNotEmpty(mainPackageJson.devDependencies, "No development dependencies!");
    assert.deepStrictEqual(mainPackageJson.devDependencies, expectedDependencies, "Wrong development dependencies in the main package.json!");
  });

  test("It should be able return an install process if requested.", async () => {
    // write the test app.json files
    const package1Path = path.join(testDirectory, "package1");
    const package1PackageJsonPath = path.join(package1Path, "package.json");
    const package2Path = path.join(testDirectory, "package2");
    const package2PackageJsonPath = path.join(package2Path, "package.json");
    await mkdir(package1Path);
    await mkdir(package2Path);
    await IntegrationHelper.createDummyTSConfig(package1Path);
    await IntegrationHelper.createDummyTSConfig(package2Path);
    await writeFile(package1PackageJsonPath, JSON.stringify(PJ_1), { encoding: "utf-8" });
    await writeFile(package2PackageJsonPath, JSON.stringify(PJ_2), { encoding: "utf-8" });

    // write the main project configuration file to use
    const configFilePath = path.join(testDirectory, ".tsprm.json");
    await writeFile(configFilePath, JSON.stringify(IntegrationHelper.createConfig(["package1", "package2"])), { encoding: "utf-8" });

    // write the main project package.json
    const mainPackageJsonPath = path.join(testDirectory, "package.json");
    await writeFile(mainPackageJsonPath, JSON.stringify(PJ_MAIN), { encoding: "utf-8" });

    const expectedDependencies = {
      boxen: "5.0.0",
      uuid: "8.3.2",
      yargs: "16.2.0"
    };

    // execute the usecase
    usecase.setRequestParam({ configFilePath, installOptions: { install: true, packageManager: "yarn" }, devDependencies: true });
    let response = await usecase.execute();
    assert.isTrue(response.success, `The usecase failed!: ${(response as ErrorResponseEntity).errorCode}`);
    response = response as MergeDependenciesResponseEntity;
    assert.strictEqual(response.payload.ignoredProjects.length, 0, "Projects were ignored!");

    // verify the dependencies were merged into the main package.json file
    const mainPackageJsonRaw = await readFile(mainPackageJsonPath, { encoding: "utf-8" });
    assert.isDefined(mainPackageJsonRaw, "Empty main package.json!");
    assert.isNotEmpty(mainPackageJsonRaw, "Empty main package.json!");

    const mainPackageJson = JSON.parse(mainPackageJsonRaw);
    assert.isDefined(mainPackageJson.dependencies, "No dependencies!");
    assert.isNotEmpty(mainPackageJson.dependencies, "No dependencies!");
    assert.deepStrictEqual(mainPackageJson.dependencies, expectedDependencies, "Wrong dependencies in the main package.json!");
    assert.isDefined(response.payload.installProcess, "The install process was not defined!");
    response.payload.installProcess?.kill();
  });
});
