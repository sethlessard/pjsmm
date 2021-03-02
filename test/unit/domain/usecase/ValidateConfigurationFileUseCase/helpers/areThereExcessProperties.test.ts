import { suite, test } from "mocha";
import { assert } from "chai";

import { areThereExcessProperties } from "../../../../../../src/domain/usecase/ValidateConfigurationFile/helpers/areThereExcessProperties";
import { ConfigurationFileEntity } from "../../../../../../src/domain/entities/ConfigurationFileEntity";

suite("domain/usecase/ValidateCofigurationFileUseCase/helpers/areThereExcessProperties", () => {
  test("It should return false for a valid Configuration file", () => {
    const configFile: ConfigurationFileEntity = { version: "1.0.0", projects: [] };
    assert.isFalse(areThereExcessProperties(configFile));
  });

  test("It should return true if there are invalid properties", () => {
    const configFile = { version: "1.0.0", projects: [], invalidProp: true } as ConfigurationFileEntity;
    assert.isTrue(areThereExcessProperties(configFile));
  })
});
