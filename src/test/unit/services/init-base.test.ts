import { Logger } from 'winston'

import { InitBase } from '../../../main/services/init-base'

describe('init base unit tests', () => {
  let log: jest.Mocked<Logger>
  beforeAll(() => {
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
  })
  describe('InitBase', () => {
    interface MyInitBaseConfig {
      foo: string
    }
    class MyInitBase extends InitBase<MyInitBaseConfig> {
      public static defaultConfig: MyInitBaseConfig = {
        foo: 'bar',
      }
      public constructor() {
        super('my-init-base', log, MyInitBase.defaultConfig)
      }
    }
    test('should provide config property initialized with defaults', () => {
      // Given
      const initBase = new MyInitBase()
      // Then
      expect(initBase.config).not.toBe(MyInitBase.defaultConfig)
      expect(initBase.config).toEqual(MyInitBase.defaultConfig)
    })
  })
})
