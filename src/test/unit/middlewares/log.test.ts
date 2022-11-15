describe('logMwFactory unit tests', () => {
  let onFinished
  let logMwFactory
  beforeAll(() => {
    jest.doMock('on-finished')
    onFinished = require('on-finished')
    ;({ logMwFactory } = require('../../../main/middlewares/log'))
  })
  it('should log request basic informations', () => {
    // Given
    const log = {
      info: jest.fn(),
    }
    const req = {
      method: 'GET',
      originalUrl: 'some_url',
    }
    const res = {
      statusCode: 200,
    }
    const next = jest.fn()
    onFinished.mockImplementation((response, cb) => {
      expect(response).toBe(res)
      cb(undefined, res)
    })
    // When
    const logMw = logMwFactory(log)
    logMw(req, res, next)
    // Then
    expect(log.info).toHaveBeenCalledWith(
      `http - ${req.method} - ${req.originalUrl} - ${res.statusCode}`,
    )
    expect(next).toHaveBeenCalled()
  })
  it('should log errror given onFinished crashing', () => {
    // Given
    const log = {
      error: jest.fn(),
    }
    const req = {
      method: 'GET',
      originalUrl: 'some_url',
    }
    const res = {
      statusCode: 200,
    }
    const next = jest.fn()
    const error = new Error('oops')
    onFinished.mockImplementation((response, cb) => {
      expect(response).toBe(res)
      cb(error, res)
    })
    // When
    const logMw = logMwFactory(log)
    logMw(req, res, next)
    // Then
    expect(log.error).toHaveBeenCalledWith(error)
    expect(next).toHaveBeenCalled()
  })
  it('should log request basic informations given no statusCode', () => {
    // Given
    const log = {
      info: jest.fn(),
    }
    const req = {
      method: 'GET',
      originalUrl: 'some_url',
    }
    const res = {}
    const next = jest.fn()
    onFinished.mockImplementation((response, cb) => {
      expect(response).toBe(res)
      cb(undefined, res)
    })
    // When
    const logMw = logMwFactory(log)
    logMw(req, res, next)
    // Then
    expect(log.info).toHaveBeenCalledWith(`http - ${req.method} - ${req.originalUrl} - ?`)
    expect(next).toHaveBeenCalled()
  })
})
