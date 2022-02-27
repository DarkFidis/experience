import { when } from 'jest-when'

import * as testConfig from '../../main/config'
import { Workerable } from '../../main/types/worker'
import { fromCallback } from '../../main/utils/helper'

describe('index unit tests', () => {
  let processExitSpy: jest.SpyInstance
  beforeEach(() => {
    jest.doMock('../../main/log')
    jest.doMock('../../main/services/web-server')
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation()
  })
  afterEach(() => {
    processExitSpy.mockRestore()
    jest.resetModules()
  })
  test('should import and execute main function given 0 worker in config', () => {
    // Given
    jest.doMock('../../main/config', () => ({
      ...testConfig,
      cluster: { workers: 0 },
    }))
    jest.doMock('../../main/master')
    const runMaster = require('../../main/master').run
    jest.doMock('../../main/worker')
    const runWorker: jest.MockedFunction<Workerable['run']> = require('../../main/worker').run
    when(runWorker).calledWith().mockResolvedValue()
    // When
    require('../../main/index')
    // Then
    expect(runWorker).toHaveBeenCalledWith()
    expect(runMaster).not.toHaveBeenCalled()
  })
  test('should exit 1 given runWorker throw an error', async () => {
    // Given
    jest.doMock('../../main/config', () => ({
      ...testConfig,
      cluster: { workers: 0 },
    }))
    jest.doMock('../../main/master')
    const runMaster = require('../../main/master').run
    jest.doMock('../../main/worker')
    const runWorker: jest.MockedFunction<Workerable['run']> = require('../../main/worker').run
    const error = new Error('oops')
    when(runWorker).calledWith().mockRejectedValue(error)
    // When
    require('../../main/index')
    // Then
    expect(runWorker).toHaveBeenCalledWith()
    expect(runMaster).not.toHaveBeenCalled()
    await fromCallback<void>((cb) => {
      process.nextTick(cb)
    })
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
  test('should import and execute main cluster function', () => {
    // Given
    jest.doMock('../../main/config', () => ({
      ...testConfig,
      cluster: { workers: 2 },
    }))
    jest.doMock('../../main/master')
    const runMaster = require('../../main/master').run
    jest.doMock('../../main/worker')
    const runWorker = require('../../main/worker').run
    // When
    require('../../main/index')
    // Then
    expect(runMaster).toHaveBeenCalledWith()
    expect(runWorker).not.toHaveBeenCalled()
  })
})

