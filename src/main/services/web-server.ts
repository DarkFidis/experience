import * as express from 'express'
import { Server } from "http"
import { RegisterApp, StaticWebServerable, WebServerable, WebServerConfig } from "../types/web-server";
import { toExpressErrorMw, staticImplements, toExpressMw } from "../utils/helper"
import { errorMw } from '../middlewares/error'
import { notFound } from '../middlewares/not-found'
import { InternalError } from "../errors/internal-error";
import { worker } from "cluster";
import { ServiceBase } from "./service-base";
import { Loggerable } from "../types/logger";

@staticImplements<StaticWebServerable>()
export class WebServer extends ServiceBase<WebServerConfig> implements WebServerable {
  public static readonly defaultConfig: WebServerConfig = {
    gitVersion: true,
    listen: { port: 2000 },
    log: true,
    ping: true,
    trustProxy: false,
  }

  protected _app?: express.Application
  protected _server?: Server
  protected _url?: string

  public registerApp?: RegisterApp

  public get app(): express.Application | undefined {
    return this._app
  }

  public get url(): string | undefined {
    return this._url
  }

  public get server(): Server | undefined {
    return this._server
  }

  constructor(log: Loggerable, registerApp?: RegisterApp) {
    super('web-server', log, WebServer.defaultConfig)
    this.registerApp = registerApp
  }

  public async init() {
    const app = express()
    this._app = app
    await this.registerMw(app)
  }

  public async run() {
    const app = this._app
    if (!app) {
      throw new Error('undefined app : cannot listen')
    }
    const server: Server = await new Promise((resolve) => {
      const _server = app.listen(this.config.listen.port, () => {
        resolve(_server)
      })
    })
    server.on('connection', () => {
      console.log('Connection OK !')
    })
    this._server = server
    const serverAddress = server.address()
    if (!serverAddress) {
      this._url = undefined
      throw new InternalError('server address is undefined')
    }
    if (typeof serverAddress === 'string') {
      this._url = `http://unix:${serverAddress}:`
    } else {
      const { port } = serverAddress
      const hostname = '127.0.0.1'
      this._url = `http://${hostname}:${port}`
    }
    this._log.info(`web server ready : ${this.url} …`)
    return true
  }

  public async end() {
    const server = this.server
    if (!server) {
      return false
    }
    await new Promise((resolve, reject) => {
      try {
        server.close(() => {
          this._log.info('web server is closed')
          resolve()
        })
      } catch (err) {
        reject(err)
      }
    })
    return true
  }

  public async registerMw(app: express.Application) {
    if (this.registerApp) {
      await this.registerApp(app)
    }
    this.registerPingMw(app)
    this.registerHelloWorldMw(app)
    this.disableEtag(app)
    this.setTrustProxy(app)
    this.registerPoweredByMw(app)
    this.registerLogMw(app)
    app.use(notFound)
    app.use(toExpressErrorMw(errorMw))
  }

  public registerPingMw(app: express.Application) {
    app.get('/ping', (__: express.Request, res: express.Response) => {
      res.status(204).end()
    })
  }

  public registerHelloWorldMw(app: express.Application) {
    app.get('/', (req: express.Request, res: express.Response) => {
      console.log('COOKIES : ', req.cookies)
      res.status(200).end('Hello world !')
    })
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

  public registerPoweredByMw(app: express.Application): void {
    if (this.config.poweredBy === true) {
      return
    }
    app.disable('x-powered-by')
    if (typeof this.config.poweredBy === 'string' || typeof this.config.poweredBy === 'undefined') {
      const poweredBy =
        this.config.poweredBy ||
        [
          this.config.name,
          `@${this.config.version}`,
          worker?.id ? ` #${String(worker.id)}` : '',
        ].join('')
      app.use(
        toExpressMw((__, res) => {
          res.setHeader('x-powered-by', poweredBy)
        }),
      )
    }
  }

  public registerLogMw(app: express.Application): void {
    if (!this.config.log) {
      return
    }
    app.use(this._log.express())
  }
}
