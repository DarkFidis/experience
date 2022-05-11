import { log } from './log'
import { registerApp } from './router'
import { WebServer } from './services/web-server'
import { WebServerable } from './types/web-server'

const webServer: WebServerable = new WebServer(log, registerApp)

export { webServer }
