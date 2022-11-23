import { ParsedUrlQueryInput } from 'querystring'

import { Mapable } from '../../main/types/basic-types'

export interface JestErrorProps {
  [k: string]: string | RegExp
}

export interface JestHelper {
  expectFnToThrow(
    fn: () => any,
    expected: jest.Constructable | Error | string | RegExp,
    props?: string | RegExp | JestErrorProps,
  ): void
  expectPromiseToReject(
    promise: Promise<any>,
    expected: jest.Constructable | Error | string | RegExp,
    props?: string | RegExp | JestErrorProps,
  ): Promise<void>
  verifyError(
    err: any,
    expected: jest.Constructable | Error | string | RegExp,
    props?: string | RegExp | JestErrorProps,
  ): void
  verifyErrorProps(err: any, props: string | RegExp | Error | JestErrorProps): void
}

export type HttpMethod =
  | 'get'
  | 'head'
  | 'post'
  | 'put'
  | 'delete'
  | 'connect'
  | 'options'
  | 'trace'
  | 'patch'

export interface E2eUsecase {
  disable?: boolean
  index: number
  json?: boolean
  method: HttpMethod
  only?: boolean
  uri: string
  qs?: ParsedUrlQueryInput
  body?: Mapable<string>
  form?: Mapable<string>
  expected?: E2eUsecaseExpected
}

export interface E2eUsecaseExpected {
  id: number
  status?: number
  bodyDesc?: string[]
  body?: any
  headers?: E2eUsecaseExpectedHeader[]
}

export interface E2eUsecaseExpectedHeader {
  [key: string]: string
}
