import { Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

describe('not found middleware unit tests', () => {
  let NotFoundError: jest.Mock
  let req: Request
  let res: Response
  let notFound: jest.Mocked<RequestHandler>
  beforeAll(() => {
    jest.doMock('../../../main/errors/not-found-error')
    ;({ NotFoundError } = require('../../../main/errors/not-found-error'))
    req = new Request()
    res = new Response()
    ;({ notFound } = require('../../../main/middlewares/not-found'))
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
  describe('notFound', () => {
    test('should respond an error', () => {
      // Given
      const next = jest.fn()
      // When
      const fn = () =>
        notFound(req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
      // Then
      try {
        fn()
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundError)
        expect(next).not.toHaveBeenCalled()
      }
    })
    test('should ignore given response is already sent', () => {
      // Given
      res.setHeadersSent(true)
      const next = jest.fn()
      // When
      notFound(req as unknown as ExpressRequest, res as unknown as ExpressResponse, next)
      // Then
      expect(next).not.toHaveBeenCalled()
    })
  })
})
