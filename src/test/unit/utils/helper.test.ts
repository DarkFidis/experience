import { Request, Response } from 'express'
import { when } from 'jest-when'

import { Callback, Helperable } from '../../../main/types/helper'

describe('helper unit tests', () => {
  let helper: Helperable
  beforeAll(() => {
    helper = require('../../../main/utils/helper')
  })
  describe('asCallback', () => {
    test('should invoke callback from promise with resolved value', (done) => {
      // Given
      const expectedValue = 'myvalue'
      const promiseFactory = jest.fn()
      promiseFactory.mockResolvedValue(expectedValue)
      const p = promiseFactory() as Promise<undefined>
      const cb: Callback<undefined> = jest.fn()
      // When
      helper.asCallback(p, cb)
      // Then
      setImmediate(() => {
        expect(cb).toHaveBeenNthCalledWith(1, null, expectedValue)
        done()
      })
    })
    test('should invoke callback from promise with rejected error', (done) => {
      // Given
      const promiseFactory = jest.fn()
      const expectedError = new Error('myerror')
      promiseFactory.mockRejectedValue(expectedError)
      const p = promiseFactory() as Promise<undefined>
      const cb: Callback<undefined> = jest.fn()
      // When
      helper.asCallback(p, cb)
      // Then
      setImmediate(() => {
        expect(cb).toHaveBeenNthCalledWith(1, expectedError)
        done()
      })
    })
  })
  describe('fromCallback', () => {
    test('should return a resolved promise with value from callback', async () => {
      // Given
      const expectedValue = 'myvalue'
      const fn: (cb) => void = (cb) => {
        cb(null, expectedValue)
      }
      // When
      const promise = helper.fromCallback(fn)
      // Then
      expect(promise).toBeDefined()
      const result = await promise
      expect(result).toEqual(expectedValue)
    })
    test('should return a rejected promise with error from callback', async () => {
      // Given
      const expectedError = new Error('myerror')
      const fn: (cb) => void = (cb) => {
        cb(expectedError)
      }
      // When
      const promise = helper.fromCallback(fn)
      // Then
      await expect(promise).rejects.toThrowError(expectedError)
    })
  })
  describe('isArray', () => {
    it('should return true if input is an array', () => {
      // When
      const result = helper.isArray(['foo', 'bar'])
      expect(result).toBe(true)
    })
  })
  describe('isObject', () => {
    it('should return true if input is an array', () => {
      // When
      const result = helper.isObject({ foo: 'bar' })
      expect(result).toBe(true)
    })
  })
  describe('repeat', () => {
    test('should repeat 3 times', () => {
      // Given
      const iterator = jest.fn()
      const count = 3
      // When
      helper.repeat(count, iterator)
      // Then
      for (let i = 0; i < count; i += 1) {
        expect(iterator).toHaveBeenCalledWith(i)
      }
      expect(iterator).toHaveBeenCalledTimes(count)
    })
  })
  describe('staticImplements', () => {
    test('should return a function', () => {
      // When
      const result = helper.staticImplements()
      // Then
      expect(typeof result).toEqual('function')
      result(undefined)
    })
  })
  describe('toExpressErrorMw', () => {
    let mockAsCallback: jest.SpyInstance
    beforeAll(() => {
      mockAsCallback = jest.spyOn(helper, 'asCallback').mockImplementation()
    })
    afterAll(() => {
      mockAsCallback.mockRestore()
    })
    test('should return an express error middleware function given a promise', () => {
      // Given
      const err = new Error('oops')
      const req = {} as Request
      const res = {} as Response
      const handler = jest.fn()
      const handlerResult = 'handler-result'
      handler.mockReturnValue(handlerResult)
      const next = jest.fn()
      when(mockAsCallback)
        .calledWith(expect.anything(), next)
        .mockImplementation(async (promise) => {
          await promise
          expect(handler).toHaveBeenCalledWith(err, req, res)
        })
      // When
      const result = helper.toExpressErrorMw(handler)
      // Then
      result(err, req, res, next)
      expect(mockAsCallback).toHaveBeenCalledWith(expect.anything(), next)
    })
  })
  describe('toExpressMw', () => {
    let mockAsCallback: jest.SpyInstance
    beforeAll(() => {
      mockAsCallback = jest.spyOn(helper, 'asCallback').mockImplementation()
    })
    afterAll(() => {
      mockAsCallback.mockRestore()
    })
    test('should return an express middleware function given a promise', () => {
      // Given
      const req = {} as Request
      const res = {} as Response
      const handler = jest.fn()
      const handlerResult = 'handler-result'
      handler.mockReturnValue(handlerResult)
      const next = jest.fn()
      when(mockAsCallback)
        .calledWith(expect.anything(), next)
        .mockImplementation(async (promise) => {
          await promise
          expect(handler).toHaveBeenCalledWith(req, res)
        })
      // When
      const result = helper.toExpressMw(handler)
      // Then
      result(req, res, next)
      expect(mockAsCallback).toHaveBeenCalledWith(expect.anything(), next)
    })
  })
})
