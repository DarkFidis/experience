enum ErrorCode {
  // CLIENT_ERROR = 'CLIENT_ERROR',
  // SERVER_ERROR = 'SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  IM_A_TEAPOT = 'IM_A_TEAPOT',
  INTERNAL = 'INTERNAL',
  NOT_FOUND = 'NOT_FOUND',
  // CONFLICT = 'CONFLICT',
  PLUGIN_EXECUTION = 'PLUGIN_EXECUTION',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

enum ErrorStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  // PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  /*
   methodNotAllowed= 405,
   notAcceptable= 406,
   proxyAuthenticationRequired= 407,
   requestTimeout= 408,
   */
  // CONFLICT = 409,
  /*
   gone= 410,
   lengthRequired= 411,
   preconditionFailed= 412,
   requestEntityTooLarge= 413,
   requestUriTooLarge= 414,
   unsupportedMediaType= 415,
   requestedRangeNotSatisfiable= 416,
   */
  // EXPECTATION_FAILED = 417,
  IM_A_TEAPOT = 418,
  /*
   unprocessableEntity= 422,
   locked= 423,
   failedDependency= 424,
   unorderCollection= 407,
   upgradeRequired= 426,
   preconditionRequired= 428,
   */
  TOO_MANY_REQUESTS = 429,
  /*
   requestHeaderFieldsTooLarge= 431,
   */
  // UNAVAILABLE_FOR_LEGAL_REASONS = 451,
  INTERNAL = 500,
  // BAD_GATEWAY = 502,
  /*
   notImplemented= 501,
   */
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  /*,
   versionNotSupported= 505,
   variantAlsoNegotiates= 506,
   insufficientStorage= 507,
   bandwidthLimitExceeded= 509,
   notExtended= 510,
   networkAuthenticationRequired= 511
   */
}

export { ErrorCode, ErrorStatusCode }
