import { ErrorResponseEntity } from "../entities/ErrorResponseEntity";

export abstract class UseCase<Request, Response> {

  protected _param: Request;

  /**
   * Execute the usecase.
   * @returns the use case response.
   */
  execute(): Promise<Response | ErrorResponseEntity> {
    return this.usecaseLogic();
  }

  /**
   * Set the use case's request parameter.
   * @param param the request param.
   */
  setRequestParam(param: Request): void {
    this._param = param;
  }

  /**
   * The use case logic.
   */
  protected abstract usecaseLogic(): Promise<Response | ErrorResponseEntity>;
}