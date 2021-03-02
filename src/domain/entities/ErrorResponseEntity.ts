import { ErrorCode } from "./ErrorCode";

export interface ErrorResponseEntity {
  success: false;
  error?: Error;
  errorCode: ErrorCode;
}
