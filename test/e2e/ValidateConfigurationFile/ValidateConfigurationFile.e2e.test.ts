import { afterEach, beforeEach, Done, suite, test } from "mocha";
import { exec } from "child_process";
import { promisify } from "util";
import { join, resolve } from "path";
import { e2eHelper, ValidateConfigTemplate } from "../e2eHelper";
import { expect } from "chai";

const pexec = promisify(exec);

suite("mm-ts validate", () => {

  let testDirectory: string;
  beforeEach(async () => {
    testDirectory = await e2eHelper.getTestDirectory();
  });

  afterEach(async () => {
    if (testDirectory) {
      await e2eHelper.cleanupTestDirectory(testDirectory);
    }
  });

  test("It should throw an error if a configuration file was not found.", (done: Done) => {
    pexec(`node lib/index.js validate --config ${resolve("/non/existant/path")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" })
      .then(({ stdout, stderr }) => {
        expect(stderr).to.match(/Error: Could not read/g, "The error message did not match!");
        expect(stdout).to.be.empty;
        done();
      })
      .catch(done);
  });

  test("It should throw an error if a configuration file has an extra and invalid property.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithExtraConfigProperty);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/There is an invalid property in the config file/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has an invalid version.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithInvalidVersion);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/Invalid 'version' property!/g, "Message did not match!");
  });

  test("It should throw an error if a project has no configuration file.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithNoConfigFile);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/Could not read the '.mm.json' configuration file!/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has no 'projects' property.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithNoProjectsProperty);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No 'projects' property!/g, "Message did not match!");
  });

  test("It should throw an error if a project has no subprojects configured.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithNoSubprojects);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No subprojects specified in the 'projects' property!/g, "Message did not match!");
  });

  test("It should throw an error if a configuration file has no 'version' property.", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithNoVersion);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stdout).to.be.empty;
    expect(stderr).to.match(/No 'version' property!/g, "Message did not match!");
  });

  test("It should be able to validate a valid configuration file (relative path).", async () => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithValidConfigFile);

    const { stdout, stderr } = await pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" });
    expect(stderr).to.be.empty;
    expect(stdout).to.match(/The configuration file is valid!/g, "Message did not match!");
  });
});
