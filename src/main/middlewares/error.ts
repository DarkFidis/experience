import { Request, Response } from 'express'

import { ErrorData, ErrorMw, RichError } from '../types/middlewares'

const error: ErrorMw = {
  defaultCode: 'SERVICE_UNAVAILABLE',
  defaultMessage: 'Service unavailable',
  errorMw: (err: RichError, __: Request, res: Response): void => {
    if (res.headersSent) {
      return
    }
    const data: ErrorData = {
      code: err.code || error.defaultCode,
      message: err.message || error.defaultMessage,
    }
    if (err.orig?.errors) {
      data.errors = err.orig.errors
    } else if (err.orig) {
      data.errors = [err.orig.toString()]
    }
    if (err.extra) {
      Object.assign(data, err.extra)
    }
    const statusCode = err.statusCode || 500
    res.status(statusCode)
    res.json(data)
  },
}

export = error
