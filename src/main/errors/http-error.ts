import { HttpErrorable, StaticHttpErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { CustomError } from './custom-error'
import { ErrorCode } from './http-error-codes'

@staticImplements<StaticHttpErrorable>()
class HttpError extends CustomError implements HttpErrorable {
  protected _code: ErrorCode
  protected _statusCode: number
  protected _extra?: unknown

  constructor(
    code: ErrorCode,
    statusCode: number,
    message?: string | Error,
    orig?: Error,
    extra?: unknown,
  ) {
    super(message, orig)
    this._code = code
    this._statusCode = statusCode
    this._extra = extra
  }

  public get code(): ErrorCode {
    return this._code
  }

  public get statusCode(): number {
    return this._statusCode
  }

  public get extra(): unknown {
    return this._extra
  }
}

export { HttpError }
