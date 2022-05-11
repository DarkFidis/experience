import {
  ErrorRequestHandler,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { ErrorCode } from '../../../main/errors/http-error-codes'
import { RichError } from '../../../main/types/middlewares'

describe('format error middleware unit test', () => {
  let errorMw: ErrorRequestHandler
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;({ errorMw } = require('../../../main/middlewares/error'))
    req = new Request()
    res = new Response()
    next = jest.fn()
  })
  beforeEach(() => {
    res.setHeadersSent(false)
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  test('should not respond if response are already sent', () => {
    // Given
    res.setHeadersSent(true)
    const error: RichError = new Error('Oops')
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })
  test('should respond an error with a code', () => {
    // Given
    const error: RichError = new Error('Oops')
    error.code = ErrorCode.NOT_FOUND
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ code: ErrorCode.NOT_FOUND, message: error.message })
  })
  test('should respond an error with a status code', () => {
    // Given
    const error: RichError = new Error('Oops')
    const statusCode = 404
    error.statusCode = statusCode
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(statusCode)
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: error.message,
    })
  })
  test('should respond an error with an extra', () => {
    // Given
    const error: RichError = new Error('Oops')
    const extra = { foo: 'bar' }
    error.extra = extra
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: error.message,
      ...extra,
    })
  })
  test('should respond an error without message', () => {
    // Given
    const error: RichError = new Error()
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: 'Service unavailable',
    })
  })
  test('should respond an error with an orig', () => {
    // Given
    const error: RichError = new Error('oops')
    error.orig = new Error('original error')
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      errors: [error.orig.toString()],
      message: error.message,
    })
  })
  test('should respond an error with details given an origin error provides multiple errors', () => {
    // Given
    const error: RichError = new Error('oops')
    error.orig = new Error('original error')
    error.orig.errors = ['first error', 'second error']
    // When
    errorMw(error, req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
    // Then
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      code: 'SERVICE_UNAVAILABLE',
      errors: ['first error', 'second error'],
      message: 'oops',
    })
  })
})
