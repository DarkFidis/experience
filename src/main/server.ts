import { WebServer } from "./services/web-server";
import { WebServerable } from "./types/web-server";
import { registerApp } from "./router";
import { log } from "./log";

const webServer: WebServerable = new WebServer(log, registerApp)

export { webServer }
