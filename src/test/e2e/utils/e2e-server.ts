import * as clientHelper from "./client-helper";
import { log } from "../../../main/log";
import { E2eServer } from "../../types/e2e-utils";
import * as worker from '../../../main/worker'

export const e2eServer: E2eServer = {
  start: async () => {
    e2eServer.processExitMock = jest.spyOn(process, 'exit').mockImplementation()
    await worker.run()
    clientHelper.init()
    log.debug('using base URL :', clientHelper.baseUrl)
  },
  stop: async () => {
    await worker.shutdown()
    expect(e2eServer.processExitMock).toHaveBeenNthCalledWith(1, 1)
    if (e2eServer.processExitMock) {
      e2eServer.processExitMock.mockRestore()
    }
  },
}
