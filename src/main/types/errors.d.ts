import { ErrorCode } from '../errors/http-error-codes'

export interface HttpErrorable {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly extra?: unknown
}

export type StaticBadRequestErrorable = new (
  message?: string | Error,
  orig?: Error,
) => HttpErrorable

export interface StaticForbiddenErrorable {
  defaultMessage: string
  new (message?: string | Error, orig?: Error): HttpErrorable
}

export interface StaticTeapotErrorable {
  defaultMessage: string
  new (message?: string | Error, orig?: Error): HttpErrorable
}

export type StaticHttpErrorable = new (
  code: ErrorCode,
  statusCode: number,
  message?: string | Error,
  orig?: Error,
  extra?: unknown,
) => HttpErrorable

export type StaticInternalErrorable = StaticBadRequestErrorable

export interface StaticNotFoundErrorable {
  defaultMessage: string
  new (message?: string | Error, orig?: Error, extra?: unknown): HttpErrorable
}

export type StaticServiceUnavailableErrorable = StaticNotFoundErrorable

export type StaticGatewayTimeoutErrorable = StaticServiceUnavailableErrorable

export interface StaticTooManyRequestsErrorable {
  new (quotaCount: number, quotaTime: number, extra?: unknown): HttpErrorable
}

export type StaticUnauthorizedErrorable = StaticForbiddenErrorable
