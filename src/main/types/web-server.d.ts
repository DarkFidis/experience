import * as express from 'express'
import { Server } from "http"
import { ServerOptions } from "https";
import { Serviceable } from "./service";
import { Loggerable } from "./logger";

export type RegisterApp = (app: express.Application) => Promise<void>

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

export interface StaticWebServerable {
  defaultConfig: WebServerConfig
  new (log: Loggerable, registerApp?: RegisterApp): WebServerable
}

export interface WebServerable extends Serviceable<WebServerConfig> {
  readonly app?: express.Application
  readonly server?: Server
  readonly url?: string
  init(): Promise<void>
  start(): Promise<boolean>
  stop(): Promise<boolean>
  registerMw(app: express.Application): Promise<void>
  registerPingMw(app: express.Application): void
  registerHelloWorldMw(app: express.Application): void
  disableEtag(app: express.Application): void
  registerPoweredByMw(app: express.Application): void
  setTrustProxy(app: express.Application): void
}
