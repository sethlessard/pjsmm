import { suite, test } from "mocha";
import { expect } from "chai";

import { mergeDependencies } from "../../../../../../src/domain/usecase/MergeDependencies/helpers/mergeDependencies";
import { DependencyDefinition, PartialPackageJsonEntity } from "../../../../../../src/domain/entities/PartialPackageJsonEntity";

const PACKAGE1: PartialPackageJsonEntity = {
  name: "1",
  version: "1.0.0",
  dependencies: {
    package1: "1.2.3",
    package3: "3.0.2"
  },
  devDependencies: {}
};
const PACKAGE2 = {
  name: "1",
  version: "1.0.0",
  dependencies: {
    package1: "1.2.5",
    package2: "2.0.0"
  },
  devDependencies: {}
};

suite("domain/usecase/MergeDependencies/helpers/mergeDependencies", () => {

  test("It should be able to merge more than one dependency object", () => {
    const allDependencies: PartialPackageJsonEntity[] = [PACKAGE1, PACKAGE2];

    const expectedDependencies: DependencyDefinition = {
      package1: "1.2.5",
      package2: "2.0.0",
      package3: "3.0.2"
    };

    expect(mergeDependencies(allDependencies).dependencies)
      .to.deep.equal(expectedDependencies);
  });
});
