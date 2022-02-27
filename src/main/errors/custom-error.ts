class CustomError extends Error {
  protected static handleArgs(
    message?: string | Error,
    orig?: Error,
  ): {
    message?: string
    orig?: Error
  } {
    const args: {
      message?: string
      orig?: Error
    } = {}
    if (message instanceof Error) {
      args.orig = message
      args.message = args.orig.message
    } else {
      args.orig = orig
      args.message = message
    }
    return args
  }

  protected readonly _orig?: Error

  constructor(message?: string | Error, orig?: Error) {
    const args = CustomError.handleArgs(message, orig)
    super(args.message)
    this._orig = args.orig
    const actualProto = new.target.prototype
    Object.setPrototypeOf(this, actualProto)
  }

  public get orig(): Error | undefined {
    return this._orig
  }
}

export { CustomError }
