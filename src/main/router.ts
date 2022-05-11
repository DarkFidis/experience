import {
  json as jsonBodyParserFactory,
  raw as rawBodyParserFactory,
  urlencoded as urlencodedBodyParserFactory,
} from 'body-parser'
import * as cookieParserFactory from 'cookie-parser'

import { helloWorldMw } from './middlewares/hello-world'
import { RegisterApp } from './types/web-server'
import { toExpressMw } from './utils/helper'

const jsonBodyParserMw = jsonBodyParserFactory()
const urlencodedBodyParserMw = urlencodedBodyParserFactory({ extended: false })
const rawBodyParserMw = rawBodyParserFactory({ limit: '10mb', type: '*/*' })
const cookieParserMw = cookieParserFactory()

export const registerApp: RegisterApp = (app) => {
  app.use(cookieParserMw, jsonBodyParserMw, urlencodedBodyParserMw, rawBodyParserMw)
  app.get('/', toExpressMw(helloWorldMw))
}
