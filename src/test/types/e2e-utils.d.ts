import { Got, Response } from 'got'

export interface ClientHelper {
  baseUrl: string
  client: Got
  init: () => void
}

export interface E2eServer {
  stop: () => Promise<void>
  start: () => Promise<void>
  processExitMock?: jest.SpyInstance
}

export interface E2eHelper {
  expectResponse: (res: Response, statusCode: number, body?) => void
  waitForLogInfo: (
    logInfoSpy: jest.SpyInstance<(...data: unknown[]) => void>,
  ) => (logMessage) => Promise<void>
}
