import * as express from 'express'
import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import { ServerOptions } from 'https'
import { Logger } from 'winston'

import { Serviceable } from './service'

export interface WebServerConfig {
  name?: string
  version?: string
  baseUrl?: string | null
  etag?: boolean
  gitVersion?: boolean
  listen: WebServerConfigListen
  log?: boolean
  ping?: boolean
  poweredBy?: boolean | string
  proxy?: WebServerConfigProxy
  serverOptions?: ServerOptions
  staticDir?: string
  tls?: boolean
  trustProxy?: boolean | string | string[]
}

export interface WebServerConfigListen {
  port?: number
  host?: string
  path?: string
}

export interface WebServerConfigProxy {
  username?: string
  pass?: string
  address: string
  port: number
  protocol?: 'http' | 'https'
}

export type RegisterApp = (app: express.Application) => void

export interface StaticWebServerable {
  defaultConfig: WebServerConfig

  new (log: Logger, registerApp?: RegisterApp): WebServerable
}

export interface WebServerable extends Serviceable<WebServerConfig> {
  readonly app?: express.Application
  readonly server?: HttpServer | HttpsServer
  readonly url?: string
  readonly startedAt?: string
  registerApp?: RegisterApp
  disableEtag(app: express.Application): void
  registerMw(app: express.Application): void
  registerPingMw(app: express.Application): void
  setTrustProxy(app: express.Application): void
}
