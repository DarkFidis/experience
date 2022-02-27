// import { ErrorRequestHandler, RequestHandler } from "express";

import { StaticWebServerable } from "../../../main/types/web-server";
import { InternalError } from "../../../main/errors/internal-error";
import { Loggerable } from "../../../main/types/logger";

const jestExpress = require('jest-express')

describe('WebServer unit tests', () => {
  /*
  let toExpressErrorMw: jest.Mock
  let errorMw: jest.Mocked<ErrorRequestHandler>
  let notFound: jest.Mocked<RequestHandler>
   */
  let WebServer: StaticWebServerable
  let express: jest.Mocked<typeof jestExpress>
  let log: jest.Mocked<Loggerable>
  beforeAll(() => {
    /*
    jest.doMock('../../../main/utils/helper')
    ;({ toExpressErrorMw } = require('../../../main/utils/helper'))
    jest.doMock('../../../main/middlewares/error')
    ;({ errorMw } = require('../../../main/middlewares/error'))
    jest.doMock('../../../main/middlewares/not-found')
    ;({ notFound } = require('../../../main/middlewares/not-found'))
     */
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
    const expressMock: jest.Mocked<typeof jestExpress> = jest.fn(jestExpress)
    expressMock.static = jestExpress.static
    jest.doMock('express', () => expressMock)
    express = require('express')
    ;({ WebServer } = require('../../../main/services/web-server'))
  })

  afterAll(() => {
    jest.resetModules()
  })

  describe('instance', () => {
    let webServer
    beforeAll(() => {
      webServer = new WebServer(log)
    })

    describe('init', () => {
      let spyRegisterMw
      beforeAll(() => {
        spyRegisterMw = jest.spyOn(webServer, 'registerMw').mockImplementation()
      })
      afterAll(() => {
        spyRegisterMw.mockRestore()
      })

      test('should init the server', () => {
        // When
        webServer.init()
        // Then
        expect(express).toHaveBeenCalled()
        expect(webServer.app).toBeTruthy()
        expect(webServer.registerMw).toHaveBeenCalled()
      })
    })

    describe('run', () => {
      beforeEach(() => {
        webServer._app = express()
      })

      test('should start the server with port address', async () => {
        // Given
        webServer._app.listen.mockImplementation((__, cb) => {
          setImmediate(cb)
          return {
            on: jest.fn(),
            address: jest.fn().mockImplementation(() => ({
              port: 12345
            }))
          }
        })
        // When
        const started = await webServer.run()
        // Then
        expect(webServer._server).toBeDefined()
        expect(webServer._url).toBe('http://127.0.0.1:12345')
        expect(started).toBe(true)
      })

      test('should start the server with string address', async () => {
        // Given
        webServer._app.listen.mockImplementation((__, cb) => {
          setImmediate(cb)
          return {
            on: jest.fn(),
            address: jest.fn().mockImplementation(() => ('myserver'))
          }
        })
        // When
        const started = await webServer.run()
        // Then
        expect(webServer._server).toBeDefined()
        expect(webServer._url).toBe('http://unix:myserver:')
        expect(started).toBe(true)
      })

      test('it should reject given no webServer.app', async () => {
        // Given
        webServer._app = undefined
        // When
        try {
          await webServer.run()
        } catch (err) {
          expect(err).toHaveProperty('message', 'undefined app : cannot listen')
          return
        }
        throw new Error('Promise did not reject')
      })

      test('it should reject given no server address', async () => {
        // Given
        webServer._app.listen.mockImplementation((__, cb) => {
          setImmediate(cb)
          return {
            on: jest.fn(),
            address: jest.fn()
          }
        })
        // When
        try {
          await webServer.run()
        } catch (err) {
          expect(err).toBeInstanceOf(InternalError)
          expect(err).toHaveProperty('message', 'server address is undefined')
          return
        }
        throw new Error('Promise did not reject')
      })
    })

    describe('end', () => {
      test('should stop the server', async () => {
        // Given
        webServer._server = {
          close: jest.fn().mockImplementation(cb => setImmediate(cb))
        }
        // When
        const stopped = await webServer.end()
        // Then
        expect(webServer._server.close).toHaveBeenCalled()
        expect(stopped).toBe(true)
      })

      test('should return false given no server', async () => {
        // Given
        webServer._server = undefined
        // When
        const stopped = await webServer.end()
        // Then
        expect(stopped).toBe(false)
      })

      test('should throw an error if server.close rejects', async () => {
        // Given
        const errorMessage = 'oops'
        webServer._server = {
          close: jest.fn().mockImplementation(() => {
            throw new Error(errorMessage)
          })
        }
        // When
        try {
          await webServer.end()
        } catch(err) {
          expect(err).toHaveProperty('message', errorMessage)
          return
        }
        throw new Error('Promise did not reject')
      })
    })
  })
})
