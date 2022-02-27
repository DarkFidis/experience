import { ConnectionOptions } from "typeorm";
import { Serviceable } from "./service";
import { Loggerable } from "./logger";

export interface StaticPgClientable {
  new (log: Loggerable, config: ConnectionOptions): PgClientable
}

export interface PgClientable extends Serviceable<ConnectionOptions> {
  run(): Promise<boolean>
  end(): Promise<boolean>
}
