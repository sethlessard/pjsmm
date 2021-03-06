import { suite, test } from "mocha";
import { assert } from "chai";

import { compareVersions } from "../../../../../../src/domain/usecase/MergeDependencies/helpers/compareVersions";

suite("domain/usecase/MergeDependencies/helpers/compareVersions", () => {

  test("It should return 'eq' when versions are equal.", () => {
    assert.strictEqual(compareVersions("1.2.3", "1.2.3"), "eq", "Didn't return 'eq'!");
    assert.strictEqual(compareVersions("2.0.0", "2.0.0"), "eq", "Didn't return 'eq'!");
    assert.strictEqual(compareVersions("2.1.0", "2.1.0"), "eq", "Didn't return 'eq'!");
  });

  test("It should return 'v1' when the first version parameter supplied is greater.", () => {
    assert.strictEqual(compareVersions("2.2.3", "1.2.3"), "v1", "Didn't return 'v1'!");
    assert.strictEqual(compareVersions("2.1.0", "2.0.0"), "v1", "Didn't return 'v1'!");
    assert.strictEqual(compareVersions("2.1.0", "2.0.1"), "v1", "Didn't return 'v1'!");
  });

  test("It should return 'v2' when the first version parameter supplied is greater.", () => {
    assert.strictEqual(compareVersions("1.2.3", "3.2.3"), "v2", "Didn't return 'v2'!");
    assert.strictEqual(compareVersions("2.1.0", "2.2.0"), "v2", "Didn't return 'v2'!");
    assert.strictEqual(compareVersions("2.1.0", "3.0.1"), "v2", "Didn't return 'v2'!");
  });

  test("'*' should always outrank any other specified version", () => {
    assert.strictEqual(compareVersions("*", "1.2.3"), "v1");
    assert.strictEqual(compareVersions("*", "2.2.3"), "v1");
    assert.strictEqual(compareVersions("3.0.0", "*"), "v2");
  });
});
