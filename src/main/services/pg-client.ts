import { staticImplements } from "../utils/helper";
import { Connection, ConnectionOptions, createConnection } from "typeorm";
import { PgClientable, StaticPgClientable } from "../types/pg-client";
import { ServiceBase } from "./service-base";
import { Loggerable } from "../types/logger";

@staticImplements<StaticPgClientable>()
export class PgClient extends ServiceBase<ConnectionOptions> implements PgClientable {
  protected _connection?: Connection

  constructor(log: Loggerable, config: ConnectionOptions) {
    super('pg-client', log, config)
  }

  public async run() {
    try {
      this._connection = await createConnection(this.config)
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }

  public async end() {
    if (!this._connection) {
      this._log.warn('No connection found')
      return false
    }
    try {
      await this._connection.close()
    } catch (err) {
      this._log.error(err)
      return false
    }
    return true
  }
}
