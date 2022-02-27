import { StaticBadRequestErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticBadRequestErrorable>()
class BadRequestError extends HttpError {
  constructor(message?: string | Error, orig?: Error) {
    super(ErrorCode.BAD_REQUEST, ErrorStatusCode.BAD_REQUEST, message, orig)
  }
}

export { BadRequestError }
