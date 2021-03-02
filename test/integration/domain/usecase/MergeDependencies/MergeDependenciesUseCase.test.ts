
import { afterEach, beforeEach, suite, test } from "mocha";
import { assert } from "chai";
import * as path from "path";
import { readFile, writeFile } from "fs/promises";

import { IntegrationHelper } from "../../../IntegrationHelper";
import { MergeDependenciesUseCase } from "../../../../../src/domain/usecase/MergeDependencies/MergeDependenciesUseCase";

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
    rimraf: "3.0.2"
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
    chai: "4.3.0",
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
    testDirectory = await IntegrationHelper.getTestDirectory();
    usecase = new MergeDependenciesUseCase();
  });
  afterEach(async () => {
    if (testDirectory) {
      await IntegrationHelper.cleanupTestDirectory(testDirectory);
    }
    testDirectory = "";
  });

  test("It should be able to merge multiple subproject package.json dependencies.", async () => {
    // write the test app.json files
    const package1Path = path.join(testDirectory, "package1");
    const package1AppJsonPath = path.join(package1Path, "app.json");
    const package2Path = path.join(testDirectory, "package2");
    const package2AppJsonPath = path.join(package2Path, "app.json");
    await writeFile(package1AppJsonPath, JSON.stringify(PJ_1), { encoding: "utf-8" });
    await writeFile(package2AppJsonPath, JSON.stringify(PJ_2), { encoding: "utf-8" });

    // write the main project configuration file to use
    await writeFile(path.join(testDirectory, ".mm.json"), JSON.stringify(IntegrationHelper.createConfig()), { encoding: "utf-8" });

    // write the main project package.json
    const mainPackageJsonPath = path.join(testDirectory, "package.json");
    await writeFile(mainPackageJsonPath, JSON.stringify(PJ_MAIN), { encoding: "utf-8" });

    const expectedDependencies = {
      boxen: "5.0.0",
      uuid: "8.3.2",
      yargs: "16.2.0"
    };

    // execute the usecase
    // usecase.setRequestParam();
    const response = await usecase.execute();
    assert.isTrue(response.success, "The usecase failed!");
    
    // verify the dependencies were merged into the main package.json file
    const mainPackageJsonRaw = await readFile(mainPackageJsonPath, { encoding: "utf-8" });
    assert.isDefined(mainPackageJsonRaw, "Empty main package.json!");
    assert.isNotEmpty(mainPackageJsonRaw, "Empty main package.json!");

    const mainPackageJson = JSON.parse(mainPackageJsonRaw);
    assert.isDefined(mainPackageJson.dependencies, "No dependencies!");
    assert.isNotEmpty(mainPackageJson.dependencies, "No dependencies!");
    assert.deepStrictEqual(mainPackageJson.dependencies, expectedDependencies, "Wrong dependencies in the main package.json!");
  });

  // TODO: more tests
});
