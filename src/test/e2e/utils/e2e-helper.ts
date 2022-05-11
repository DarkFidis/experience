import { Response } from 'got'

import { log } from '../../../main/log'
import { E2eHelper } from '../../types/e2e-utils'

const e2eHelper: E2eHelper = {
  expectResponse: (res: Response, statusCode: number, body?): void => {
    try {
      expect(res.statusCode).toEqual(statusCode)
      expect(res.headers).toHaveProperty('date')
      expect(res.headers.date).toBeTruthy()
      if (res.headers.date) {
        const now = Date.now()
        const dateHeaderValue = Date.parse(res.headers.date)
        expect(dateHeaderValue).toBeLessThanOrEqual(now)
        expect(dateHeaderValue).toBeGreaterThan(now - 3000)
      }
      if (body) {
        expect(res.headers).toHaveProperty('content-type', 'application/json; charset=utf-8')
        expect(res.body).toEqual(body)
        if (res.headers['transfer-encoding'] !== 'chunked') {
          expect(res.headers).toHaveProperty('content-length', `${JSON.stringify(body).length}`)
        }
      } else if (body === null) {
        expect(res.headers).not.toHaveProperty('content-type')
        expect(res.headers).not.toHaveProperty('content-length')
      }
    } catch (err) {
      if (body) {
        log.debug('actual body :', res.body)
      }
      throw err
    }
  },
  waitForLogInfo: (logInfoSpy) => async (logMessage) =>
    new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        try {
          expect(logInfoSpy).toHaveBeenCalledWith(logMessage)
          clearInterval(timer)
          resolve()
        } catch (e) {
          // Try again until start message is logged
        }
      }, 10)
    }),
}

export = e2eHelper
