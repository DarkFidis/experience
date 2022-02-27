import { StaticTeapotErrorable } from '../types/errors'
import { staticImplements } from '../utils/helper'
import { HttpError } from './http-error'
import { ErrorCode, ErrorStatusCode } from './http-error-codes'

@staticImplements<StaticTeapotErrorable>()
class TeapotError extends HttpError {
  public static defaultMessage = 'What do you think I am ?'
  constructor(message: string | Error = TeapotError.defaultMessage, orig?: Error) {
    super(ErrorCode.FORBIDDEN, ErrorStatusCode.FORBIDDEN, message, orig)
  }
}

export { TeapotError }
