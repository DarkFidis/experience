import { Request, RequestHandler, Response } from 'express'

import { NotFoundError } from '../errors/not-found-error'

const notFound: RequestHandler = (__: Request, res: Response) => {
  if (res.headersSent) {
    return
  }
  throw new NotFoundError()
}

export { notFound }
