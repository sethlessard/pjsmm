import { suite, test } from "mocha";
import { assert } from "chai";

import { areThereExcessProjectProperties } from "../../../../../../src/domain/usecase/ValidateConfigurationFile/helpers/areThereExcessProjectProperties";

suite("domain/usecase/ValidateCofigurationFileUseCase/helpers/areThereExcessProjectProperties", () => {
  test("It should return false if the project definitions are valid.", () => {
    assert.isFalse(areThereExcessProjectProperties([{ rootDir: "path/to/project" }]));
  });

  test("It should return true if there are invalid properties", () => {
    // @ts-expect-error
    assert.isTrue(areThereExcessProjectProperties([({ rootDir: "path/to/project", invalidProp: true } as Subproject)]));
  })
});
