import { Request, Response } from 'express'

export interface ErrorMw {
  defaultCode: string
  defaultMessage: string

  errorMw: ErrorRequestAsyncHandler
}

export type ErrorRequestAsyncHandler = (
  err: RichError,
  req: Request,
  res: Response,
) => Promise<void> | void

export interface ErrorData {
  code: string
  message: string
  errors?: string[]
}

export type RequestAsyncHandler = (req: Request, res: Response) => Promise<void> | void

export interface RichError extends Error {
  code?: string
  statusCode?: number
  orig?: { errors: string[] }
  extra?: unknown
}
