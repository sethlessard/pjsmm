/* eslint-disable @typescript-eslint/ban-ts-comment */
import { suite, test } from "mocha";
import { assert } from "chai";

import { ConfigurationFileEntity } from "../../../../../src/domain/entities/ConfigurationFileEntity";
import { ConfigurationFileValidator } from "../../../../../src/domain/entities/validators/ConfigurationFileValidator";
import { ProjectEntity } from "../../../../../src/domain/entities/ProjectEntity";
import { ErrorCode } from "../../../../../src/domain/entities/ErrorCode";

const VALID1: ConfigurationFileEntity = {
  version: "1.0.0",
  projects: [],
  filePath: ""
};
const VALID2: ConfigurationFileEntity = {
  version: "1.0.0",
  projects: [
    {
      rootDir: "path/to/subproject1"
    },
    {
      rootDir: "path/to/subproject2"
    },
    {
      rootDir: "path/to/subproject3"
    }
  ],
  filePath: ""
};
// @ts-expect-error
const EXPECT_NO_VERSION: ConfigurationFileEntity = {
  projects: [],
  filePath: ""
};
const EXPECT_INVALID_VERSION: ConfigurationFileEntity = {
  // @ts-expect-error
  version: "1.0.1",
  projects: [],
  filePath: ""
};
// @ts-expect-error
const EXPECT_NO_PROJECTS: ConfigurationFileEntity = {
  version: "1.0.0",
  filePath: ""
};
const EXPECT_EXTRA_PROPERTY: ConfigurationFileEntity = {
  version: "1.0.0",
  projects: [],
  filePath: "",
  // @ts-expect-error
  extraProperty: "yep"
};
const EXPECT_EXTRA_PROJECT_PROPERTY: ConfigurationFileEntity = {
  version: "1.0.0",
  projects: [
    {
      rootDir: "path",
      // @ts-expect-error
      extraProp: "hi"
    }
  ],
  filePath: ""
};

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

  suite("validate", () => {
    test("It should return 'undefined' when supplied a valid configuration file.", () => {
      assert.isUndefined(ConfigurationFileValidator.validate(VALID1));
      assert.isUndefined(ConfigurationFileValidator.validate(VALID2));
    });

    test("It should return with an error code when supplied an invalid configuration file.", () => {
      assert.strictEqual(ConfigurationFileValidator.validate(EXPECT_EXTRA_PROJECT_PROPERTY), ErrorCode.CONFIG_INVALID_PROPERTY);
      assert.strictEqual(ConfigurationFileValidator.validate(EXPECT_EXTRA_PROPERTY), ErrorCode.CONFIG_INVALID_PROPERTY);
      assert.strictEqual(ConfigurationFileValidator.validate(EXPECT_NO_PROJECTS), ErrorCode.CONFIG_NO_PROJECTS_PROP);
      assert.strictEqual(ConfigurationFileValidator.validate(EXPECT_NO_VERSION), ErrorCode.CONFIG_NO_VERSION);
      assert.strictEqual(ConfigurationFileValidator.validate(EXPECT_INVALID_VERSION), ErrorCode.CONFIG_INVALID_VERSION);
    });
  });
});
