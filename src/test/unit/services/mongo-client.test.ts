import { when } from 'jest-when'
import { Logger } from 'winston'

import { MongoClientable, MongoConfig, StaticMongoClientable } from '../../../main/types/mongo'

describe('MongoClient', () => {
  let log: jest.Mocked<Logger>
  let MongoClient: StaticMongoClientable
  const config: MongoConfig = {
    url: 'mongodb://url_de_test',
  }
  let connect: jest.Mock
  beforeAll(() => {
    jest.doMock('mongoose')
    ;({ connect } = require('mongoose'))
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
    ;({ MongoClient } = require('../../../main/services/mongo-client'))
  })
  describe('constructor', () => {
    it('should create an instance of MongoClient', () => {
      // When
      const result = new MongoClient(log, config)
      // Then
      expect(result).toHaveProperty('config', config)
    })
  })
  describe('instance', () => {
    let mongoClient: MongoClientable
    const connection = {
      disconnect: jest.fn(),
    }
    beforeEach(() => {
      mongoClient = new MongoClient(log, config)
    })
    describe('run', () => {
      afterAll(() => {
        jest.restoreAllMocks()
      })
      it('should return true if connection succeeds', async () => {
        // Given
        when(connect).calledWith(config.url).mockResolvedValue(connection)
        // When
        const result = await mongoClient.run()
        // Then
        expect(connect).toHaveBeenCalledWith(config.url)
        expect(log.info).toHaveBeenCalledWith('Connected')
        expect(result).toBe(true)
      })
      it('should return false if connection fails', async () => {
        const error = new Error('oops')
        when(connect).calledWith(config.url).mockRejectedValue(error)
        // When
        const result = await mongoClient.run()
        // Then
        expect(connect).toHaveBeenCalledWith(config.url)
        expect(log.error).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
      })
    })
    describe('end', () => {
      it('should close connection and return true', async () => {
        // Given
        when(connect).calledWith(config.url).mockResolvedValue(connection)
        connection.disconnect.mockResolvedValue(true)
        await mongoClient.run()
        // When
        const result = await mongoClient.end()
        // Then
        expect(connection.disconnect).toHaveBeenCalled()
        expect(result).toBe(true)
      })
      it('should return false given no connection', async () => {
        // When
        const result = await mongoClient.end()
        // Then
        expect(log.warning).toHaveBeenCalledWith('No connection found')
        expect(result).toBe(false)
      })
      it('should return false if disconnect fails', async () => {
        // Given
        when(connect).calledWith(config.url).mockResolvedValue(connection)
        const error = new Error('oops')
        connection.disconnect.mockRejectedValue(error)
        await mongoClient.run()
        // When
        const result = await mongoClient.end()
        // Then
        expect(connection.disconnect).toHaveBeenCalled()
        expect(log.error).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
      })
    })
  })
})
