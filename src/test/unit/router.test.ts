import { Application } from 'express'
import { when } from 'jest-when'

import { RegisterApp } from '../../main/types/web-server'

const jestExpress = require('jest-express')

describe('router unit tests', () => {
  let jsonBodyParser: jest.Mock
  let urlencodedBodyParser: jest.Mock
  let rawBodyParser: jest.Mock
  let cookieParserFactory: jest.Mock
  let express: jest.Mocked<typeof jestExpress>
  let cookieParserMw: jest.Mock
  let registerApp: jest.Mocked<RegisterApp>
  beforeAll(() => {
    jsonBodyParser = jest.fn()
    urlencodedBodyParser = jest.fn()
    rawBodyParser = jest.fn()
    const bodyParser = {
      json: jest.fn(),
      raw: jest.fn(),
      urlencoded: jest.fn(),
    }
    when(bodyParser.json)
      .calledWith()
      .mockReturnValue(jsonBodyParser)
    when(bodyParser.urlencoded)
      .calledWith({ extended: false })
      .mockReturnValue(urlencodedBodyParser)
    when(bodyParser.raw).calledWith({ limit: '10mb', type: '*/*' }).mockReturnValue(rawBodyParser)
    jest.doMock('body-parser', () => bodyParser)
    jest.doMock('cookie-parser')
    cookieParserFactory = require('cookie-parser')
    cookieParserMw = jest.fn()
    when(cookieParserFactory).calledWith().mockReturnValue(cookieParserMw)
    ;({ registerApp } = require('../../main/router'))
    expect(cookieParserFactory).toHaveBeenNthCalledWith(1)
    const expressMock: jest.Mocked<typeof jestExpress> = jest.fn(
      jestExpress as ((...args: unknown[]) => unknown) | undefined,
    )
    expressMock.static = jestExpress.static
    jest.doMock('express', () => expressMock)
    express = require('express')
  })
  describe('registerApp', () => {
    test('should register app middlewares', () => {
      // Given
      const app = express()
      // When
      registerApp(app as Application)
      // Then
      expect(app.use).toHaveBeenCalledWith(
        cookieParserMw,
        jsonBodyParser,
        urlencodedBodyParser,
        rawBodyParser,
      )
    })
  })
})
