import { ErrorRequestHandler, RequestHandler } from 'express'

import { ErrorRequestAsyncHandler, RequestAsyncHandler } from './middlewares'

export interface Helperable {
  asCallback: <T>(promise: Promise<T>, cb: Callback<T>) => void
  fromCallback: <T>(fn: (cb: Callback<T>) => void) => Promise<T>
  isArray: <T>(o: T | T[]) => o is T[]
  isObject: <T>(o: T | T[]) => o is T
  repeat: (count: number, iterator: (index: number) => void) => void
  staticImplements: <T>() => (__: T) => void
  toExpressErrorMw: (
    errorHandler: ErrorRequestAsyncHandler,
    asCallbackImpl?: Helperable['asCallback'],
  ) => ErrorRequestHandler

  toExpressMw: (
    handler: RequestAsyncHandler,
    asCallbackImpl?: Helperable['asCallback'],
  ) => RequestHandler
}

export type Callback<T> = (err: unknown, value?: T) => void

export type Modify<T, R> = Omit<T, keyof R> & R
