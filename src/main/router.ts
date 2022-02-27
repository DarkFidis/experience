import { RegisterApp } from "./types/web-server";
import * as cookieParserFactory from "cookie-parser";
import {
  json as jsonBodyParserFactory,
  raw as rawBodyParserFactory,
  urlencoded as urlencodedBodyParserFactory,
} from "body-parser"

const jsonBodyParserMw = jsonBodyParserFactory()
const urlencodedBodyParserMw = urlencodedBodyParserFactory({ extended: false })
const rawBodyParserMw = rawBodyParserFactory({ limit: '10mb', type: '*/*' })
const cookieParserMw = cookieParserFactory()

export const registerApp: RegisterApp = async (app) => {
  app.use(
    cookieParserMw,
    jsonBodyParserMw,
    urlencodedBodyParserMw,
    rawBodyParserMw
  )
}
