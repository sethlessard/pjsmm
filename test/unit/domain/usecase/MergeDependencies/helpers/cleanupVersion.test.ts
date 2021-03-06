import { suite, test } from "mocha";
import { assert } from "chai";

import { cleanupVersion } from "../../../../../../src/domain/usecase/MergeDependencies/helpers/cleanupVersion";


suite("domain/usecase/MergeDependencies/helpers/cleanupVersion", () => {

  test("It should remove a leading '~'", () => {
    assert.strictEqual(cleanupVersion("~13.2.0"), "13.2.0", "It didn't remove the '~'!");
    assert.strictEqual(cleanupVersion("~1.2.3"), "1.2.3", "It didn't remove the '~'!");
  });

  test("It should remove a leading '^'", () => {
    assert.strictEqual(cleanupVersion("^1.2.0"), "1.2.0", "It didn't remove the '^'!");
    assert.strictEqual(cleanupVersion("^2.3.8"), "2.3.8", "It didn't remove the '^'!");
  });
});
