import { suite, test } from "mocha";
import { assert } from "chai";

import { ConfigurationFileEntity } from "../../../../../src/domain/entities/ConfigurationFileEntity";
import { ConfigurationFileValidator } from "../../../../../src/domain/entities/validators/ConfigurationFileValidator";
import { ProjectEntity } from "../../../../../src/domain/entities/ProjectEntity";

suite("domain/entities/validators/ConfiguraionFileValidator", () => {

  suite("areThereExcessProperties", () => {
    test("It should return false for a valid Configuration file", () => {
      const configFile: ConfigurationFileEntity = { version: "1.0.0", projects: [], filePath: "" };
      assert.isFalse(ConfigurationFileValidator.areThereExcessProperties(configFile));
    });

    test("It should return true if there are invalid properties", () => {
      const configFile = { version: "1.0.0", projects: [], invalidProp: true, filePath: "" } as ConfigurationFileEntity;
      assert.isTrue(ConfigurationFileValidator.areThereExcessProperties(configFile));
    });
  });

  suite("areThereExcessProjectProperties", () => {
    test("It should return false if the project definitions are valid.", () => {
      assert.isFalse(ConfigurationFileValidator.areThereExcessProjectProperties([{ rootDir: "path/to/project" }]));
    });
  
    test("It should return true if there are invalid properties", () => {
      assert.isTrue(ConfigurationFileValidator.areThereExcessProjectProperties([({ rootDir: "path/to/project", invalidProp: true } as ProjectEntity)]));
    });
  });
});
