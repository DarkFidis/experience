import { NextFunction, Request, Response } from 'express'
import * as onFinished from 'on-finished'
import { Logger } from 'winston'

import { LogMwFactory } from '../types/middlewares'

export const logMwFactory: LogMwFactory =
  (log: Logger) => (req: Request, response: Response, next: NextFunction) => {
    onFinished(response, (err, res) => {
      if (err) {
        log.error(err)
        return
      }
      const statusCode = typeof res.statusCode !== 'undefined' ? res.statusCode : '?'
      log.info(`http - ${req.method} - ${req.originalUrl} - ${statusCode}`)
    })
    next()
  }
