import {
  json as jsonBodyParserFactory,
  raw as rawBodyParserFactory,
  urlencoded as urlencodedBodyParserFactory,
} from 'body-parser'
import * as cookieParserFactory from 'cookie-parser'
import * as corsFactory from 'cors'

import { helloWorldMw } from './middlewares/hello-world'
import { RegisterApp } from './types/web-server'
import { toExpressMw } from './utils/helper'

const jsonBodyParserMw = jsonBodyParserFactory()
const urlencodedBodyParserMw = urlencodedBodyParserFactory({ extended: false })
const rawBodyParserMw = rawBodyParserFactory({ limit: '10mb', type: '*/*' })
const cookieParserMw = cookieParserFactory()
const corsMw = corsFactory()

export const registerApp: RegisterApp = (app) => {
  app.use(corsMw, cookieParserMw, jsonBodyParserMw, urlencodedBodyParserMw, rawBodyParserMw)
  app.get('/', toExpressMw(helloWorldMw))
}
