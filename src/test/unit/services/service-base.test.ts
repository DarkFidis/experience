import { when } from 'jest-when'

import { ServiceBase } from '../../../main/services/service-base'
import { Serviceable } from '../../../main/types/service'
import { Logger } from '../../../main/utils/logger'

describe('service base unit tests', () => {
  let log: jest.Mocked<Logger>
  beforeAll(() => {
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('ServiceBase', () => {
    interface MyServiceBaseConfig {
      foo: string
    }
    class MyServiceBase extends ServiceBase<MyServiceBaseConfig> {
      public static defaultConfig: MyServiceBaseConfig = {
        foo: 'bar',
      }
      public constructor() {
        super('my-service-base', log, MyServiceBase.defaultConfig)
      }

      public async end(): Promise<boolean> {
        return Promise.resolve(false)
      }

      public async run(): Promise<boolean> {
        return Promise.resolve(false)
      }
    }
    let endSpy: jest.SpyInstance<Promise<boolean>>
    let runSpy: jest.SpyInstance<Promise<boolean>>
    beforeAll(() => {
      endSpy = jest.spyOn(MyServiceBase.prototype, 'end').mockImplementation()
      runSpy = jest.spyOn(MyServiceBase.prototype, 'run').mockImplementation()
    })
    afterAll(() => {
      endSpy.mockRestore()
      runSpy.mockRestore()
    })
    describe('instance', () => {
      let myServiceBase: Serviceable<MyServiceBaseConfig>
      beforeEach(() => {
        myServiceBase = new MyServiceBase()
      })
      test('should provide state properties', () => {
        // When
        // Then
        expect(myServiceBase.state).toEqual({ started: false, stopping: false })
      })
      describe('init', () => {
        test('should initialize given options', () => {
          // Given
          const opt: Partial<MyServiceBaseConfig> = {
            foo: 'hello',
          }
          // When
          myServiceBase.init(opt)
          // Then
          expect(myServiceBase.config).toEqual({
            foo: 'hello',
          })
        })
      })
      describe('start', () => {
        let initSpy: jest.SpyInstance<void>
        beforeAll(() => {
          initSpy = jest.spyOn(MyServiceBase.prototype, 'init').mockImplementation()
        })
        afterAll(() => {
          initSpy.mockRestore()
        })
        test('should start', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(true)
          // When
          const result = await myServiceBase.start()
          // Then
          expect(result).toEqual(true)
          expect(myServiceBase.state.started).toEqual(true)
          expect(runSpy).toHaveBeenCalledWith()
        })
        test('should fail to start', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(false)
          // When
          const result = await myServiceBase.start()
          // Then
          expect(result).toEqual(false)
          expect(myServiceBase.state).toEqual({ started: false, stopping: false })
          expect(runSpy).toHaveBeenCalledWith()
        })
        test('should not start given already started', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(true)
          await myServiceBase.start()
          jest.resetAllMocks()
          // When
          const result = await myServiceBase.start()
          // Then
          expect(result).toEqual(false)
          expect(myServiceBase.state).toEqual({ started: true, stopping: false })
          expect(initSpy).not.toHaveBeenCalled()
          expect(runSpy).not.toHaveBeenCalled()
        })
      })
      describe('stop', () => {
        test('should stop', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(true)
          await myServiceBase.start()
          when(endSpy).calledWith().mockResolvedValue(true)
          // When
          const promise = myServiceBase.stop()
          // Then
          expect(myServiceBase.state).toEqual({ started: true, stopping: true })
          const result = await promise
          expect(result).toEqual(true)
          expect(myServiceBase.state).toEqual({ started: false, stopping: false })
          expect(endSpy).toHaveBeenCalled()
        })
        test('should fail to stop', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(true)
          await myServiceBase.start()
          when(endSpy).calledWith().mockResolvedValue(false)
          // When
          const promise = myServiceBase.stop()
          // Then
          expect(myServiceBase.state).toEqual({ started: true, stopping: true })
          const result = await promise
          expect(result).toEqual(false)
          expect(myServiceBase.state).toEqual({ started: true, stopping: false })
          expect(endSpy).toHaveBeenCalled()
        })
        test('should not stop given already stopped', async () => {
          // When
          const result = await myServiceBase.stop()
          // Then
          expect(result).toEqual(false)
          expect(myServiceBase.state).toEqual({ started: false, stopping: false })
          expect(endSpy).not.toHaveBeenCalled()
        })
        test('should not stop given already stopping', async () => {
          // Given
          when(runSpy).calledWith().mockResolvedValue(true)
          await myServiceBase.start()
          when(endSpy).calledWith().mockResolvedValue(true)
          const promise = myServiceBase.stop()
          expect(myServiceBase.state).toEqual({ started: true, stopping: true })
          jest.resetAllMocks()
          // When
          const result = await myServiceBase.stop()
          // Then
          expect(result).toEqual(false)
          expect(myServiceBase.state).toEqual({ started: false, stopping: false })
          expect(endSpy).not.toHaveBeenCalled()
          await promise
        })
      })
    })
  })
})
