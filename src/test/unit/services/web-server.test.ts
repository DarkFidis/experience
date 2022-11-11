import { ErrorRequestHandler, RequestHandler } from 'express'
import { ServerOptions } from 'https'
import { when } from 'jest-when'
import { noop } from 'lodash'
import { Logger } from 'winston'

import { ServiceBase } from '../../../main/services/service-base'
import { Optional } from '../../../main/types/basic-types'
import { StaticWebServerable, WebServerConfig } from '../../../main/types/web-server'

const jestExpress = require('jest-express')

const { set } = Reflect

describe('web server unit tests', () => {
  const cluster: { worker?: { id: string } } = { worker: { id: 'myworkerid' } }
  let createHttpServer: jest.Mock
  let HttpServer: jest.Mock
  let createHttpsServer: jest.Mock
  let HttpsServer: jest.Mock
  let express: jest.Mocked<typeof jestExpress>
  let Socket: jest.Mock
  let fsPromises: { unlink: jest.Mock }
  let log: jest.Mocked<Logger>
  let InternalError: jest.Mock
  let errorMw: jest.Mocked<ErrorRequestHandler>
  let notFound: jest.Mocked<RequestHandler>
  let toExpressErrorMw: jest.SpyInstance
  let WebServer: StaticWebServerable
  beforeAll(() => {
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
    jest.doMock('http')
    ;({ createServer: createHttpServer, Server: HttpServer } = require('http'))
    jest.doMock('https')
    ;({ createServer: createHttpsServer, Server: HttpsServer } = require('https'))
    jest.doMock('cluster', () => cluster)
    const expressMock: jest.Mocked<typeof jestExpress> = jest.fn(
      jestExpress as ((...args: unknown[]) => unknown) | undefined,
    )
    expressMock.static = jestExpress.static
    jest.doMock('express', () => expressMock)
    express = require('express')
    jest.doMock('net')
    ;({ Socket } = require('net'))
    jest.doMock('fs')
    const fs = require('fs')
    fs.promises = { unlink: jest.fn() }
    fsPromises = fs.promises
    jest.doMock('../../../main/errors/internal-error')
    ;({ InternalError } = require('../../../main/errors/internal-error'))
    jest.doMock('../../../main/middlewares/error')
    ;({ errorMw } = require('../../../main/middlewares/error'))
    jest.doMock('../../../main/middlewares/not-found')
    ;({ notFound } = require('../../../main/middlewares/not-found'))
    const helper = require('../../../main/utils/helper')
    toExpressErrorMw = jest.spyOn(helper, 'toExpressErrorMw').mockImplementation(noop)
    ;({ WebServer } = require('../../../main/services/web-server'))
  })
  describe('WebServer', () => {
    test('should provide a default config', () => {
      // Then
      expect(WebServer.defaultConfig).toEqual({
        gitVersion: true,
        listen: {
          port: 5000,
        },
        log: true,
        ping: true,
        poweredBy: 'Express-template',
        trustProxy: false,
      })
    })
    describe('constructor', () => {
      test('should return an instance', () => {
        // When
        const result = new WebServer(log)
        // Then
        expect(result).toBeTruthy()
        expect(result).toBeInstanceOf(WebServer)
        expect(result).toHaveProperty('app', undefined)
        expect(result).toHaveProperty('url', undefined)
        expect(result).toHaveProperty('server', undefined)
      })
    })
    describe('instance', () => {
      let webServer
      beforeAll(() => {
        webServer = new WebServer(log)
      })
      beforeEach(() => {
        webServer._server = new HttpServer() as (...args: unknown[]) => void
        webServer.server.close.mockImplementation((cb) => {
          setImmediate(cb as (...args: unknown[]) => void)
        })
      })
      describe('end', () => {
        test('should close the web server and return true', async () => {
          // When
          const result = await webServer.end()
          // Then
          expect(result).toBe(true)
          expect(webServer.server).toBeTruthy()
          expect(webServer.server.removeAllListeners).toHaveBeenCalledTimes(1)
          expect(webServer.server.close).toHaveBeenCalledTimes(1)
        })
        test('should return false given undefined server', async () => {
          // Given
          webServer._server = undefined
          // When
          const result = await webServer.end()
          // Then
          expect(result).toBe(false)
        })
        test('should close server sockets', async () => {
          // Given
          const socket = { destroy: jest.fn() }
          webServer._sockets = [socket]
          // When
          const result = await webServer.end()
          // Then
          expect(result).toBe(true)
          expect(socket.destroy).toHaveBeenCalledWith()
        })
        test('should reject given close throws error', async () => {
          // Given
          const errorMessage = 'oops'
          webServer.server.close.mockImplementation(() => {
            throw new Error(errorMessage)
          })
          // When
          try {
            await webServer.end()
          } catch (err: any) {
            // Then
            expect(err.message).toBe(errorMessage)
            expect(webServer.server).toBeTruthy()
            expect(webServer.server.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(webServer.server.close).toHaveBeenCalledTimes(1)
            return
          }
          throw new Error('Promise did not reject')
        })
      })
      describe('init', () => {
        let spyRegisterMw
        let spyServiceBaseInit
        beforeAll(() => {
          spyRegisterMw = jest.spyOn(webServer, 'registerMw').mockImplementation()
          spyServiceBaseInit = jest.spyOn(ServiceBase.prototype, 'init').mockImplementation()
        })
        afterAll(() => {
          spyServiceBaseInit.mockRestore()
          spyRegisterMw.mockRestore()
        })
        afterEach(() => {
          webServer._config = { ...WebServer.defaultConfig }
        })
        test('should initialize the server given defaults', () => {
          // Given
          const opt: Optional<Partial<WebServerConfig>> = undefined
          // When
          webServer.init(opt)
          // Then
          expect(spyServiceBaseInit).toHaveBeenCalledWith(opt)
          expect(express).toHaveBeenCalled()
          expect(webServer.app).toBeTruthy()
          expect(webServer.registerMw).toHaveBeenCalled()
        })
      })
      describe('run', () => {
        let mockHttpServer
        let mockHttpsServer
        beforeAll(() => {
          mockHttpServer = new HttpServer()
          mockHttpsServer = new HttpsServer()
        })
        beforeEach(() => {
          webServer._app = express()
          delete webServer._server
          delete webServer._url
          webServer._config = {}
          fsPromises.unlink.mockImplementation()
        })
        test('should create a http server listening on given port', async () => {
          // Given
          webServer._sockets = []
          webServer.config.listen = {
            path: undefined,
            port: 12345,
          }
          when(createHttpServer).calledWith(webServer.app).mockReturnValue(mockHttpServer)
          mockHttpServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpServer
          })
          mockHttpServer.address.mockImplementation(() => ({
            port: webServer.config.listen.port,
          }))
          const socket = new Socket()
          socket.once.mockImplementation((event, listener) => {
            if (event === 'close') {
              listener()
            }
          })
          mockHttpServer.on.mockImplementation((event, listener) => {
            if (event === 'connection') {
              listener(socket)
            }
          })
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(createHttpServer).toHaveBeenNthCalledWith(1, webServer.app)
          expect(mockHttpServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(webServer.server).toBeTruthy()
          expect(webServer.server.address).toHaveBeenCalled()
          expect(webServer.url).toEqual(`http://127.0.0.1:${webServer.config.listen.port}`)
          expect(mockHttpServer.on).toHaveBeenCalledWith('connection', expect.any(Function))
          expect(socket.once).toHaveBeenCalledWith('close', expect.any(Function))
          expect(webServer._sockets.length).toBe(0)
        })
        test('should create a https server listening on given port', async () => {
          // Given
          webServer._sockets = []
          webServer.config.tls = true
          webServer.config.listen = {
            path: undefined,
            port: 12345,
          }
          when(createHttpsServer).calledWith(webServer.app).mockReturnValue(mockHttpsServer)
          mockHttpsServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpsServer
          })
          mockHttpsServer.address.mockImplementation(() => ({
            port: webServer.config.listen.port,
          }))
          const socket = new Socket()
          socket.once.mockImplementation((event, listener) => {
            if (event === 'close') {
              listener()
            }
          })
          mockHttpsServer.on.mockImplementation((event, listener) => {
            if (event === 'connection') {
              listener(socket)
            }
          })
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(createHttpsServer).toHaveBeenNthCalledWith(1, webServer.app)
          expect(mockHttpsServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(webServer.server).toBeTruthy()
          expect(webServer.server.address).toHaveBeenCalled()
          expect(webServer.url).toEqual(`https://127.0.0.1:${webServer.config.listen.port}`)
          expect(mockHttpsServer.on).toHaveBeenCalledWith('connection', expect.any(Function))
          expect(socket.once).toHaveBeenCalledWith('close', expect.any(Function))
          expect(webServer._sockets.length).toBe(0)
        })
        test('should create a https server listening on given port with given agent options', async () => {
          // Given
          webServer._sockets = []
          const serverOptions: ServerOptions = {
            cert: 'mycert',
            key: 'mykey',
          }
          webServer.config.serverOptions = serverOptions
          webServer.config.tls = true
          webServer.config.listen = {
            path: undefined,
            port: 12345,
          }
          when(createHttpsServer)
            .calledWith(serverOptions, webServer.app)
            .mockReturnValue(mockHttpsServer)
          mockHttpsServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpsServer
          })
          mockHttpsServer.address.mockImplementation(() => ({
            port: webServer.config.listen.port,
          }))
          const socket = new Socket()
          socket.once.mockImplementation((event, listener) => {
            if (event === 'close') {
              listener()
            }
          })
          mockHttpsServer.on.mockImplementation((event, listener) => {
            if (event === 'connection') {
              listener(socket)
            }
          })
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(createHttpsServer).toHaveBeenNthCalledWith(1, serverOptions, webServer.app)
          expect(mockHttpsServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(webServer.server).toBeTruthy()
          expect(webServer.server.address).toHaveBeenCalled()
          expect(webServer.url).toEqual(`https://127.0.0.1:${webServer.config.listen.port}`)
          expect(mockHttpsServer.on).toHaveBeenCalledWith('connection', expect.any(Function))
          expect(socket.once).toHaveBeenCalledWith('close', expect.any(Function))
          expect(webServer._sockets.length).toBe(0)
        })
        test('should create a server listening on given port given a base url in config', async () => {
          // Given
          webServer._sockets = []
          webServer.config.baseUrl = 'mybaseurl'
          webServer.config.listen = {
            path: undefined,
            port: 12345,
          }
          when(createHttpServer).calledWith(webServer.app).mockReturnValue(mockHttpServer)
          mockHttpServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpServer
          })
          const socket = new Socket()
          socket.once.mockImplementation((event, listener) => {
            if (event === 'close') {
              listener()
            }
          })
          mockHttpServer.on.mockImplementation((event, listener) => {
            if (event === 'connection') {
              listener(socket)
            }
          })
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(webServer.server).toBeTruthy()
          expect(createHttpServer).toHaveBeenNthCalledWith(1, webServer.app)
          expect(mockHttpServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(webServer.server.address).not.toHaveBeenCalled()
          expect(webServer.url).toEqual(webServer.config.baseUrl)
          expect(mockHttpServer.on).toHaveBeenCalledWith('connection', expect.any(Function))
          expect(socket.once).toHaveBeenCalledWith('close', expect.any(Function))
          expect(webServer._sockets.length).toBe(0)
        })
        test('should throw an error given undefined app', async () => {
          // Given
          webServer._app = undefined
          // When
          try {
            await webServer.run()
          } catch (err) {
            // Then
            expect(err).toBeInstanceOf(InternalError)
            expect(InternalError).toHaveBeenNthCalledWith(1, 'undefined app : cannot listen')
            expect(webServer.server).toBeUndefined()
            expect(webServer.url).toBeUndefined()
            return
          }
          throw new Error('Promise did not reject')
        })
        test('should throw an error given unlink unix socket fail', async () => {
          // Given
          webServer.config.listen = { path: 'my unix socket' }
          const error = new Error('oops')
          fsPromises.unlink.mockImplementation(() => Promise.reject(error))
          // When
          try {
            await webServer.run()
          } catch (err: any) {
            // Then
            expect(err.message).toBe(error.message)
            expect(fsPromises.unlink).toHaveBeenCalledWith(webServer.config.listen.path)
            expect(webServer.server).toBeUndefined()
            expect(webServer.url).toBeUndefined()
            return
          }
          throw new Error('Promise did not reject')
        })
        test('should create a server without url given no server address', async () => {
          // Given
          webServer.config.listen = { port: 12345 }
          when(createHttpServer).calledWith(webServer.app).mockReturnValue(mockHttpServer)
          mockHttpServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpServer
          })
          mockHttpServer.address.mockImplementation(() => undefined)
          // When
          try {
            await webServer.run()
          } catch (err) {
            // Then
            expect(err).toBeInstanceOf(InternalError)
            expect(InternalError).toHaveBeenNthCalledWith(1, 'server address is undefined')
            expect(createHttpServer).toHaveBeenNthCalledWith(1, webServer.app)
            expect(mockHttpServer.listen).toHaveBeenCalledWith(
              webServer.config.listen,
              expect.anything(),
            )
            expect(mockHttpServer.address).toHaveBeenCalled()
            expect(webServer.server).toBe(mockHttpServer)
            expect(webServer.url).toBeUndefined()
            return
          }
          throw new Error('Promise did not reject')
        })
        test('should create a server listening on given unix socket path', async () => {
          // Given
          webServer.config.listen = { path: 'my unix socket' }
          when(createHttpServer).calledWith(webServer.app).mockReturnValue(mockHttpServer)
          mockHttpServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpServer
          })
          mockHttpServer.address.mockImplementation(() => webServer.config.listen.path)
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(fsPromises.unlink).toHaveBeenCalledWith(webServer.config.listen.path)
          expect(createHttpServer).toHaveBeenNthCalledWith(1, webServer.app)
          expect(mockHttpServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(mockHttpServer.address).toHaveBeenCalled()
          expect(webServer.server).toBe(mockHttpServer)
          expect(webServer.url).toEqual(`http://unix:${webServer.config.listen.path}:`)
        })
        test('should run given a new unix socket', async () => {
          // Given
          webServer.config.listen = { path: 'my unix socket' }
          const error = new Error('file does not exist')
          set(error, 'code', 'ENOENT')
          fsPromises.unlink.mockImplementation(() => {
            throw error
          })
          when(createHttpServer).calledWith(webServer.app).mockReturnValue(mockHttpServer)
          mockHttpServer.listen.mockImplementation((__, cb) => {
            setImmediate(cb as (...args: unknown[]) => void)
            return mockHttpServer
          })
          mockHttpServer.address.mockImplementation(() => webServer.config.listen.path)
          // When
          const result = await webServer.run()
          // Then
          expect(result).toBe(true)
          expect(fsPromises.unlink).toHaveBeenCalledWith(webServer.config.listen.path)
          expect(createHttpServer).toHaveBeenNthCalledWith(1, webServer.app)
          expect(mockHttpServer.listen).toHaveBeenCalledWith(
            webServer.config.listen,
            expect.anything(),
          )
          expect(mockHttpServer.address).toHaveBeenCalled()
          expect(webServer.server).toBe(mockHttpServer)
          expect(webServer.url).toEqual(`http://unix:${webServer.config.listen.path}:`)
        })
      })
      describe('registerMw', () => {
        let app
        let disableEtag
        let setTrustProxy
        let registerPingMw
        beforeAll(() => {
          app = express()
          disableEtag = jest.spyOn(webServer, 'disableEtag').mockImplementation()
          setTrustProxy = jest.spyOn(webServer, 'setTrustProxy').mockImplementation()
          registerPingMw = jest.spyOn(webServer, 'registerPingMw').mockImplementation()
        })
        beforeEach(() => {
          delete webServer.registerAppMw
        })
        afterAll(() => {
          disableEtag.mockRestore()
          setTrustProxy.mockRestore()
          registerPingMw.mockRestore()
        })
        test('should register middlewares', () => {
          // Given
          const errorExpressMw = jest.fn()
          when(toExpressErrorMw).calledWith(errorMw).mockReturnValue(errorExpressMw)
          // When
          webServer.registerMw(app)
          // Then
          expect(disableEtag).toHaveBeenCalledWith(app)
          expect(setTrustProxy).toHaveBeenCalledWith(app)
          expect(registerPingMw).toHaveBeenCalledWith(app)
          expect(app.use).toHaveBeenCalledWith(notFound)
          expect(toExpressErrorMw).toHaveBeenCalledWith(errorMw)
          expect(app.use).toHaveBeenCalledWith(errorExpressMw)
        })
        test('should register middlewares given registerAppMw is defined', () => {
          // Given
          webServer.registerApp = jest.fn()
          const errorExpressMw = jest.fn()
          when(toExpressErrorMw).calledWith(errorMw).mockReturnValue(errorExpressMw)
          // When
          webServer.registerMw(app)
          // Then
          expect(disableEtag).toHaveBeenCalledWith(app)
          expect(setTrustProxy).toHaveBeenCalledWith(app)
          expect(registerPingMw).toHaveBeenCalledWith(app)
          expect(webServer.registerApp).toHaveBeenCalledWith(app)
          expect(app.use).toHaveBeenCalledWith(notFound)
          expect(toExpressErrorMw).toHaveBeenCalledWith(errorMw)
          expect(app.use).toHaveBeenCalledWith(errorExpressMw)
        })
      })
      describe('disableEtag', () => {
        test('should not disable etag given etag config', () => {
          // Given
          webServer._config = { etag: true }
          const app = express()
          // When
          webServer.disableEtag(app)
          // Then
          expect(app.disable).not.toHaveBeenCalled()
        })
        test('should disable etag by default', () => {
          // Given
          webServer._config = {}
          const app = express()
          // When
          webServer.disableEtag(app)
          // Then
          expect(app.disable).toHaveBeenCalledWith('etag')
        })
      })
      describe('setTrustProxy', () => {
        test('should set trust proxy', () => {
          // Given
          webServer._config = { trustProxy: '127.0.0.1' }
          const app = express()
          // When
          webServer.setTrustProxy(app)
          // Then
          expect(app.set).toHaveBeenCalledWith('trust proxy', webServer.config.trustProxy)
        })
        test('should not set trust proxy given trust proxy is undefined in config', () => {
          // Given
          webServer._config = {}
          const app = express()
          // When
          webServer.setTrustProxy(app)
          // Then
          expect(app.set).not.toHaveBeenCalledWith('trust proxy', expect.any)
        })
      })
      describe('registerPingMw', () => {
        test('should register ping middleware', () => {
          // Given
          webServer._config = { ping: true }
          const app = express()
          when(app.get as unknown as jest.MockInstance<unknown, any[]>)
            .calledWith('/ping', expect.any(Function))
            .mockImplementation((__, cb) => {
              const end = jest.fn()
              const res = { status: jest.fn().mockReturnValue({ end }) }
              cb(undefined, res)
              expect(res.status).toHaveBeenCalledWith(204)
              expect(end).toHaveBeenCalledWith()
            })
          // When
          webServer.registerPingMw(app)
          // Then
          expect(app.get).toHaveBeenCalledWith('/ping', expect.any(Function))
        })
        test('should not register ping middleware given ping is false in config', () => {
          // Given
          webServer._config = { ping: false }
          const app = express()
          // When
          webServer.registerPingMw(app)
          // Then
          expect(app.get).not.toHaveBeenCalled()
        })
      })
    })
  })
})
