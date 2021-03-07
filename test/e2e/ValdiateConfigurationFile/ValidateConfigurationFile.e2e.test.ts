import { Done, suite, test } from "mocha";
import { exec } from "child_process";
import { promisify } from "util";
import { join, resolve } from "path";
import { e2eHelper } from "../e2eHelper";
import { expect } from "chai";

const pexec = promisify(exec);

// TODO: test projects within this directory

suite("mm-ts validate", () => {

  test("It should throw an error if a configuration file was not found.", (done: Done) => {
    pexec(`node lib/index.js validate ${resolve("/non/existant/path")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" })
      .then(({ stdout, stderr }) => {
        expect(stderr).to.match(/Error: Could not read/g, "The error message did not match!");
        expect(stdout).to.be.empty;
        done();
      })
      .catch(done);
  });

  test("It should be able to validate a valid configuration file (relative path).", (done: Done) => {
    pexec(`node lib/index.js validate ${join("example", ".mm.json")}`, { cwd: e2eHelper.getProjectRoot(), encoding: "utf-8" })
      .then(({ stdout, stderr }) => {
        expect(stderr).to.be.empty;
        expect(stdout).to.match(/The configuration file is valid!/g, "Message did not match!");
        done();
      })
      .catch(done);
  });
});
