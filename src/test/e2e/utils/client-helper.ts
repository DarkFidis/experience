import got from 'got'

import { ClientHelper } from '../../types/e2e-utils'

const clientHelper: ClientHelper = {
  baseUrl: 'http://localhost:8342',
  client: got,
  init: () => {
    const { webServer } = require('../../../main/server')
    if (process.env.BASE_URL) {
      clientHelper.baseUrl = process.env.BASE_URL
    } else if (webServer.url) {
      clientHelper.baseUrl = webServer.url
    }
    clientHelper.client = got.extend({
      prefixUrl: clientHelper.baseUrl,
      responseType: 'json',
      retry: {
        limit: 0,
      },
      throwHttpErrors: false,
      timeout: {
        request: 5000,
      },
    })
  },
}

export = clientHelper
