// import { UseCase } from "../UseCase";

import { ErrorResponseEntity } from "src/domain/entities/ErrorResponseEntity";
import { UseCase } from "../UseCase";

export class MergeDependenciesUseCase extends UseCase<undefined, undefined> {

  /**
   * Merge the dependencies of two or more package.josn files from typescript subprojects
   * into a single package.json.
   */
  protected usecaseLogic(): Promise<ErrorResponseEntity | undefined> {
    throw new Error("Method not implemented.");
  }


}
