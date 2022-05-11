import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

describe('hello world middleware unit test', () => {
  let req: Request
  let res: Response
  let helloWorldMw
  beforeAll(() => {
    req = new Request()
    res = new Response()
    ;({ helloWorldMw } = require('../../../main/middlewares/hello-world'))
  })
  it('should respond with an object', () => {
    // When
    helloWorldMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
    // Then
    expect(res.json).toHaveBeenCalledWith({ hello: 'world' })
  })
})
