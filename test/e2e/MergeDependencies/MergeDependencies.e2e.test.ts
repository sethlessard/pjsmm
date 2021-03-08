import { afterEach, beforeEach, suite, test } from "mocha";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { e2eHelper, MergeDependenciesTemplate } from "../e2eHelper";
import { expect } from "chai";

const pexec = promisify(exec);

/**
 * package.json dependency entry.
 *  { "package": "version" }
 */
type DependencyDefinition = { [name: string]: string };

interface PartialPackageJsonEntity {

  /**
  * The npm package name.
  */
  name: string;

  /**
  * The version.
  */
  version: string;

  /**
  * The dependencies
  */
  dependencies: DependencyDefinition;

  /**
  * The development dependencies
  */
  devDependencies: DependencyDefinition;
}

suite("mm-ts merge", () => {

  let testDirectory: string;
  beforeEach(async () => {
    testDirectory = await e2eHelper.getTestDirectory();
  });

  afterEach(async () => {
    if (testDirectory) {
      await e2eHelper.cleanupTestDirectory(testDirectory);
    }
  });

  test("It should throw an error if a configuration file was not found.", async () => {
    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${resolve(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });

    expect(stderr).to.match(/Error: Could not read/g, "The error message did not match!");
    expect(stdout).to.be.empty;
  });

  test("It should throw an error if a configuration file has an extra and invalid property.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithExtraConfigProperty);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/There is an invalid property in the config file/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has an invalid version.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithInvalidVersion);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/Invalid 'version' property!/g, "Message did not match!");
  });

  test("It should throw an error if a project has no configuration file.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithNoConfigFile);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/Could not read the '.tsprm.json' configuration file!/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has no 'projects' property.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithNoProjectsProperty);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No 'projects' property!/g, "Message did not match!");
  });

  test("It should throw an error if a project has no subprojects configured.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithNoSubprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No subprojects specified in the 'projects' property!/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has no 'version' property.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ProjectWithNoVersion);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No 'version' property!/g, "Message did not match!");
  });

  test("It should be able to merge the dependencies of more than one TypeScript subproject.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ValidProjectWith3Subprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")} --skipDev`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stderr).to.be.empty;
    expect(stdout).to.match(/Done./g, "Message did not match!");

    // read the package.json file
    const packageJsonRaw = await readFile(join(testDirectory, "package.json"), { encoding: "utf8" });
    expect(packageJsonRaw).to.not.be.undefined.and.to.not.be.empty;

    const expectedDependencies: DependencyDefinition = {
      "body-parser": "1.19.0",
      express: "4.17.1",
      "reflect-metadata": "0.1.13",
      typeorm: "0.2.31"
    };

    const packageJson: PartialPackageJsonEntity = JSON.parse(packageJsonRaw);
    expect(packageJson.dependencies).to.eql(expectedDependencies, "Wrong dependencies!");
    expect(packageJson.devDependencies).to.eql({}, "devDependencies were populated!");
  });

  test("It should be able to merge the development dependencies of more than one TypeScript project.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ValidProjectWith3Subprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stderr).to.be.empty;
    expect(stdout).to.match(/Done./g, "Message did not match!");
    
    // read the package.json file
    const packageJsonRaw = await readFile(join(testDirectory, "package.json"), { encoding: "utf8" });
    expect(packageJsonRaw).to.not.be.undefined.and.to.not.be.empty;
    
    const expectedDependencies: DependencyDefinition = {
      "body-parser": "1.19.0",
      express: "4.17.1",
      "reflect-metadata": "0.1.13",
      typeorm: "0.2.31"
    };
    const expectedDevDependencies: DependencyDefinition = {
      "@types/chai": "4.2.15",
      "@types/mocha": "8.2.1",
      chai: "4.3.3",
      mocha: "8.3.1"
    };
    
    const packageJson: PartialPackageJsonEntity = JSON.parse(packageJsonRaw);
    expect(packageJson.dependencies).to.eql(expectedDependencies, "Wrong dependencies!");
    expect(packageJson.devDependencies).to.eql(expectedDevDependencies, "Wrong devDependencies!");
  });

  test("It should be able to install the dependencies after merging.", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ValidProjectWith3Subprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")} --install`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stderr).to.be.empty;
    expect(stdout).to.match(/Done./g, "Message did not match!");
    
    // read the package.json file
    const packageJsonRaw = await readFile(join(testDirectory, "package.json"), { encoding: "utf8" });
    expect(packageJsonRaw).to.not.be.undefined.and.to.not.be.empty;
    
    const expectedDependencies: DependencyDefinition = {
      "body-parser": "1.19.0",
      express: "4.17.1",
      "reflect-metadata": "0.1.13",
      typeorm: "0.2.31"
    };
    const expectedDevDependencies: DependencyDefinition = {
      "@types/chai": "4.2.15",
      "@types/mocha": "8.2.1",
      chai: "4.3.3",
      mocha: "8.3.1"
    };
    
    const packageJson: PartialPackageJsonEntity = JSON.parse(packageJsonRaw);
    expect(packageJson.dependencies).to.eql(expectedDependencies, "Wrong dependencies!");
    expect(packageJson.devDependencies).to.eql(expectedDevDependencies, "Wrong devDependencies!");

    expect(existsSync(join(testDirectory, "node_modules"))).to.be.true;
    expect(existsSync(join(testDirectory, "yarn.lock"))).to.be.true;
  });

  test("It should be able to install the dependencies using a custom-specified package manager", async () => {
    // setup the test
    e2eHelper.setupMergeDependenciesTestDirectory(testDirectory, MergeDependenciesTemplate.ValidProjectWith3Subprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js merge --config ${join(testDirectory, ".tsprm.json")} --install --packageManager npm`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stderr).to.be.empty;
    expect(stdout).to.match(/Done./g, "Message did not match!");
        
    // read the package.json file
    const packageJsonRaw = await readFile(join(testDirectory, "package.json"), { encoding: "utf8" });
    expect(packageJsonRaw).to.not.be.undefined.and.to.not.be.empty;
        
    const expectedDependencies: DependencyDefinition = {
      "body-parser": "1.19.0",
      express: "4.17.1",
      "reflect-metadata": "0.1.13",
      typeorm: "0.2.31"
    };
    const expectedDevDependencies: DependencyDefinition = {
      "@types/chai": "4.2.15",
      "@types/mocha": "8.2.1",
      chai: "4.3.3",
      mocha: "8.3.1"
    };
        
    const packageJson: PartialPackageJsonEntity = JSON.parse(packageJsonRaw);
    expect(packageJson.dependencies).to.eql(expectedDependencies, "Wrong dependencies!");
    expect(packageJson.devDependencies).to.eql(expectedDevDependencies, "Wrong devDependencies!");
    
    expect(existsSync(join(testDirectory, "node_modules"))).to.be.true;
    expect(existsSync(join(testDirectory, "package-lock.json"))).to.be.true;
  });
});
