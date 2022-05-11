import { when } from 'jest-when'

import { log as logConfig } from '../../main/config'
import { Loggerable } from '../../main/types/logger'

describe('log unit tests', () => {
  let Logger: jest.Mock
  beforeAll(() => {
    jest.doMock('../../main/utils/logger')
    ;({ Logger } = require('../../main/utils/logger'))
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })
  test('should create and initialize log', () => {
    // Given
    const log = {
      init: jest.fn(),
    } as unknown as jest.Mocked<Loggerable>
    when(Logger).calledWith('Express-template').mockReturnValue(log)
    // When
    const result = require('../../main/log')
    // Then
    expect(Logger).toHaveBeenNthCalledWith(1, logConfig.name)
    expect(log.init).toHaveBeenCalledTimes(1)
    expect(result).toHaveProperty('log', log)
  })
})
