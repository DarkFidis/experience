import { when } from 'jest-when'
import { Logger } from 'winston'

import { WebServerable } from '../../main/types/web-server'

describe('server unit tests', () => {
  let log: jest.Mocked<Logger>
  let registerApp: jest.Mock
  let WebServer: jest.Mock<WebServerable>
  beforeAll(() => {
    jest.doMock('../../main/log')
    ;({ log } = require('../../main/log'))
    jest.doMock('../../main/router')
    ;({ registerApp } = require('../../main/router'))
    jest.doMock('../../main/services/web-server')
    ;({ WebServer } = require('../../main/services/web-server'))
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  test('should create and initialize server', () => {
    // Given
    const webServer = {
      init: jest.fn(),
    } as unknown as jest.Mocked<WebServerable>
    when(WebServer).calledWith(log, registerApp).mockReturnValue(webServer)
    // When
    const result = require('../../main/server')
    // Then
    expect(WebServer).toHaveBeenNthCalledWith(1, log, registerApp)
    expect(result).toHaveProperty('webServer', webServer)
  })
})
