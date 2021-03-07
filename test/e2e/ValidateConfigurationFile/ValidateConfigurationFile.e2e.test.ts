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
    testDirectory = await e2eHelper.getTestDirectory(false);
  });

  afterEach(async () => {
    // if (testDirectory) {
    //   await e2eHelper.cleanupTestDirectory(testDirectory);
    // }
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

  test("It should throw an error if a configuration file has an extra and invalid property.");
  test("It should throw an error if a configuration file has an invalid version.");
  test("It should throw an error if a project has no configuration file.");
  test("It should throw an error if a configuration file has no 'projects' property.");
  test("It should throw an error if a project has no subprojects configured.");
  test("It should throw an error if a configuration file has no 'version' property.");

  test("It should be able to validate a valid configuration file (relative path).", (done: Done) => {
    // setup the test
    e2eHelper.setupValidateConfigTestDirectory(testDirectory, ValidateConfigTemplate.ProjectWithValidTemplateFile);

    pexec(`node lib/index.js validate --config ${join(testDirectory, ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" })
      .then(({ stdout, stderr }) => {
        expect(stderr).to.be.empty;
        expect(stdout).to.match(/The configuration file is valid!/g, "Message did not match!");
        done();
      })
      .catch(done);
  });
});
