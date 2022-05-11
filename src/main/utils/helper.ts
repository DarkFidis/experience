import { Callback, Helperable } from '../types/helper'

const helper: Helperable = {
  asCallback: (promise, cb) => {
    promise.then(
      (value) => {
        cb(null, value)
      },
      (err) => {
        cb(err)
      },
    )
  },
  fromCallback: async <T>(fn: (cb: Callback<T>) => void): Promise<T> =>
    new Promise((resolve, reject) => {
      fn((err, value) => {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      })
    }),
  isArray: <T>(o: T | T[]): o is T[] => typeof o === 'object' && typeof o['length'] === 'number',
  isObject: <T>(o: T | T[]): o is T => typeof o === 'object' && typeof o['length'] !== 'number',
  repeat: (count: number, iterator: (index: number) => void) => {
    Array.from(Array(count)).forEach((__, index) => {
      iterator(index)
    })
  },
  staticImplements:
    <T>() =>
    (__: T) => {},
  toExpressErrorMw:
    (errorHandler) =>
    (err, req, res, next): void => {
      helper.asCallback<void>(
        Promise.resolve().then(() => errorHandler(err, req, res)),
        next,
      )
    },
  toExpressMw:
    (handler) =>
    (req, res, next): void => {
      helper.asCallback<void>(
        Promise.resolve().then(() => handler(req, res)),
        next,
      )
    },
}

export = helper
