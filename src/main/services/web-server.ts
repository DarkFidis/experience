import * as express from 'express'
import { promises as fsPromises } from 'fs'
import { createServer as createHttpServer, Server as HttpServer } from 'http'
import { createServer as createHttpsServer, Server as HttpsServer } from 'https'
import { isNil, omitBy } from 'lodash'
import { Socket } from 'net'
import { Logger } from 'winston'

import { InternalError } from '../errors/internal-error'
import { errorMw } from '../middlewares/error'
import { notFound } from '../middlewares/not-found'
import { RichError } from '../types/middlewares'
import {
  RegisterApp,
  StaticWebServerable,
  WebServerable,
  WebServerConfig,
} from '../types/web-server'
import { fromCallback, staticImplements, toExpressErrorMw } from '../utils/helper'
import { ServiceBase } from './service-base'

@staticImplements<StaticWebServerable>()
class WebServer extends ServiceBase<WebServerConfig> implements WebServerable {
  public static readonly defaultConfig: WebServerConfig = {
    gitVersion: true,
    listen: { port: 5000 },
    log: true,
    ping: true,
    poweredBy: 'Express-template',
    trustProxy: false,
  }

  public registerApp?: RegisterApp

  protected _app?: express.Application
  protected _server?: HttpServer | HttpsServer
  protected _url?: string
  protected _sockets: Socket[] = []
  protected _serverConnectionHandler?: (socket: Socket) => void

  constructor(log: Logger, registerApp?: RegisterApp) {
    super('web-server', log, WebServer.defaultConfig)
    this.registerApp = registerApp
  }

  public get app(): express.Application | undefined {
    return this._app
  }

  public get url(): string | undefined {
    return this._url
  }

  public get server(): HttpServer | HttpsServer | undefined {
    return this._server
  }

  public async end(): Promise<boolean> {
    const server = this.server
    if (!server) {
      return false
    }
    // Destroy existing client sockets
    if (this._sockets.length) {
      this._sockets.forEach((socket, index) => {
        this._log.info('destroying socket #%s', index + 1)
        socket.destroy()
      })
    }
    // Unregister all registered listeners
    server.removeAllListeners()
    // Finally close the server
    await fromCallback<void>((cb) => {
      try {
        server.close(() => {
          this._log.info('web server is closed')
          cb(undefined)
        })
      } catch (err) {
        cb(err)
      }
    })
    return true
  }

  public init(opt?: Partial<WebServerConfig>): void {
    super.init(opt)
    const app = express()
    this._app = app
    this.registerMw(app)
  }

  public async run(): Promise<boolean> {
    const app = this.app
    if (!app) {
      throw new InternalError('undefined app : cannot listen')
    }
    if (this.config.listen.path) {
      try {
        await fsPromises.unlink(this.config.listen.path)
      } catch (err) {
        if ((err as RichError).code !== 'ENOENT') {
          throw err
        }
      }
    }
    const listenOpts = omitBy(this.config.listen, isNil)
    const createServer = this.config.tls ? createHttpsServer : createHttpServer
    const server = this.config.serverOptions
      ? createServer(this.config.serverOptions, app)
      : createServer(app)
    await fromCallback<void>((cb) => {
      server.listen(listenOpts, () => {
        cb(undefined)
      })
    })
    const serverConnectionHandler = (socket: Socket): void => {
      this._sockets.push(socket)
      const socketId = this._sockets.length
      this._log.info('new socket (#%s)', socketId)
      socket.once('close', () => {
        this._log.info('socket #%s closed', socketId)
        this._sockets.splice(socketId - 1, 1)
      })
    }
    this._serverConnectionHandler = serverConnectionHandler
    server.on('connection', serverConnectionHandler)
    this._server = server
    if (this.config.baseUrl) {
      this._url = this.config.baseUrl
    } else {
      const serverAddress = server.address()
      if (!serverAddress) {
        this._url = undefined
        throw new InternalError('server address is undefined')
      }
      const scheme = this.config.tls ? 'https' : 'http'
      if (typeof serverAddress === 'string') {
        this._url = `${scheme}://unix:${serverAddress}:`
      } else {
        const { port } = serverAddress
        const hostname = this.config.listen.host || '127.0.0.1'
        this._url = `${scheme}://${hostname}:${port}`
      }
    }
    this._log.info(`web server ready : ${this.url} …`)
    return true
  }

  public registerMw(app: express.Application): void {
    this.disableEtag(app)
    this.setTrustProxy(app)
    this.registerPingMw(app)
    if (this.registerApp) {
      this.registerApp(app)
    }
    app.use(notFound)
    app.use(toExpressErrorMw(errorMw))
  }

  public disableEtag(app: express.Application): void {
    if (this.config.etag) {
      return
    }
    app.disable('etag')
  }

  public setTrustProxy(app: express.Application): void {
    if (typeof this.config.trustProxy === 'undefined') {
      return
    }
    app.set('trust proxy', this.config.trustProxy)
  }

  public registerPingMw(app: express.Application): void {
    if (!this.config.ping) {
      return
    }
    app.get('/ping', (__: express.Request, res: express.Response) => {
      res.status(204).end()
    })
  }
}

export { WebServer }
