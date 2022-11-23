import { JestErrorProps, JestHelper } from './types/jest-helper'

const jestHelper: JestHelper = {
  expectFnToThrow: (fn, expected, props) => {
    try {
      fn()
    } catch (err) {
      jestHelper.verifyError(err, expected, props)
      return
    }
    throw new Error('function should throw a error')
  },
  expectPromiseToReject: async (promise, expected, props) => {
    try {
      await promise
    } catch (err) {
      jestHelper.verifyError(err, expected, props)
      return
    }
    throw new Error('promise should reject an error')
  },
  verifyError: (err, expected: any, props: JestErrorProps) => {
    if (expected instanceof Error) {
      expect(err).toHaveProperty('constructor.name', expected.constructor.name)
      jestHelper.verifyErrorProps(err, expected as unknown as JestErrorProps)
    } else if (typeof expected === 'string' || expected instanceof RegExp) {
      expect(err).toBeInstanceOf(Error)
      jestHelper.verifyErrorProps(err, expected)
    } else if (typeof expected === 'function') {
      expect(err).toBeInstanceOf(expected)
      jestHelper.verifyErrorProps(err, props)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jestHelper.verifyErrorProps(err, expected)
    }
  },
  verifyErrorProps: (err, props) => {
    if (typeof props === 'string' || props instanceof RegExp) {
      expect(err).toHaveProperty('message')
      expect(err.message).toMatch(props)
    } else if (props instanceof Error) {
      expect(err).toHaveProperty('message')
      expect(err.message).toMatch(props.message)
      if ((props as any).extra) {
        Object.keys((props as any).extra).forEach((name) => {
          expect(err.extra).toHaveProperty(name)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          expect(err.extra[name]).toMatch((props as any).extra[name])
        })
      }
    } else if (typeof props === 'object' && props) {
      Object.keys(props).forEach((name) => {
        expect(err).toHaveProperty(name)
        expect(err[name]).toMatch(props[name])
      })
    }
  },
}

export = jestHelper
