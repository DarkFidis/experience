import { when } from 'jest-when'
import { DataSourceOptions, EntityTarget } from 'typeorm'
import { Logger } from 'winston'

import { PgClientable, StaticPgClientable } from '../../../main/types/pg'

describe('pg-client unit tests', () => {
  let log: jest.Mocked<Logger>
  let PgClient: StaticPgClientable
  const dbConfig: DataSourceOptions = {
    database: 'mydb',
    entities: ['main/db/entities/*.js'],
    host: 'localhost',
    logging: true,
    password: 'password',
    port: 5432,
    synchronize: true,
    type: 'postgres',
    username: 'user',
  }
  beforeAll(() => {
    jest.mock('typeorm')
    jest.doMock('../../../main/log')
    ;({ log } = require('../../../main/log'))
    ;({ PgClient } = require('../../../main/services/pg-client'))
  })
  describe('constructor', () => {
    test('should instanciate DataSource with given config', () => {
      // Given
      // When
      const result = new PgClient(log, dbConfig)
      // Then
      expect(result).toHaveProperty('connection', expect.anything())
    })
  })

  describe('instance', () => {
    let pgClient: PgClientable
    beforeAll(() => {
      pgClient = new PgClient(log, dbConfig)
    })
    describe('run', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('Should initialize database connection', async () => {
        // Given
        pgClient.connection.initialize.mockImplementation(() => new Promise<void>((res) => res()))
        // When
        const result = await pgClient.run()
        // Then
        expect(pgClient.connection.initialize).toHaveBeenCalled()
        expect(log.info).toHaveBeenCalledWith('Connected to database mydb')
        expect(result).toBe(true)
      })
      test('Should return false if initialize fails', async () => {
        // Given
        const error = new Error('oops')
        pgClient.connection.initialize.mockImplementation(
          () =>
            new Promise<void>((_, __) => {
              throw error
            }),
        )
        // When
        const result = await pgClient.run()
        // Then
        expect(pgClient.connection.initialize).toHaveBeenCalled()
        expect(log.error).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
      })
    })

    describe('end', () => {
      afterEach(() => {
        jest.restoreAllMocks()
      })
      test('Should close database connection', async () => {
        // Given
        pgClient.connection.destroy.mockImplementation(() => new Promise<void>((res) => res()))
        // When
        const result = await pgClient.end()
        // Then
        expect(pgClient.connection.destroy).toHaveBeenCalled()
        expect(log.info).toHaveBeenCalledWith('Disconnected from database')
        expect(result).toBe(true)
      })
      test('Should return false if destroy fails', async () => {
        // Given
        const error = new Error('oops')
        pgClient.connection.destroy.mockImplementation(
          () =>
            new Promise<void>((_, __) => {
              throw error
            }),
        )
        // When
        const result = await pgClient.end()
        // Then
        expect(pgClient.connection.destroy).toHaveBeenCalled()
        expect(log.error).toHaveBeenCalledWith(error)
        expect(result).toBe(false)
      })
    })

    describe('getRepositoryFromEntity', () => {
      let getRepositorySpy: jest.SpyInstance
      beforeAll(() => {
        getRepositorySpy = jest
          .spyOn(pgClient.connection, 'getRepository')
          .mockImplementation(() => jest.fn())
      })
      afterAll(() => {
        getRepositorySpy.mockRestore()
      })
      test('Should return repository from a model', () => {
        // Given
        const myEntity = {
          foo: 'bar',
        } as unknown as EntityTarget<any>
        const expectedResult = {
          create: jest.fn(),
          delete: jest.fn(),
        }
        when(getRepositorySpy).calledWith(myEntity).mockReturnValue(expectedResult)
        // When
        const result = pgClient.getRepositoryFromEntity(myEntity)
        expect(getRepositorySpy).toHaveBeenCalledWith(myEntity)
        expect(result).toBe(expectedResult)
      })
    })
    describe('clean', () => {
      let getConnectionSpy: jest.SpyInstance
      let getRepoSpy: jest.SpyInstance
      beforeAll(() => {
        getConnectionSpy = jest.spyOn(pgClient, 'connection', 'get')
        getRepoSpy = jest.spyOn(pgClient, 'getRepositoryFromEntity').mockImplementation()
      })
      afterAll(() => {
        getConnectionSpy.mockRestore()
        getRepoSpy.mockRestore()
      })
      test('it should clean test database', async () => {
        // Given
        const entityMetadatas = [
          {
            name: 'user',
          },
        ]
        getConnectionSpy.mockReturnValue({ entityMetadatas })
        const repository = {
          clear: jest.fn(),
        }
        when(getRepoSpy).calledWith(entityMetadatas[0].name).mockReturnValue(repository)
        // When
        await pgClient.clean()
        // Then
        expect(getConnectionSpy).toHaveBeenCalled()
        expect(getRepoSpy).toHaveBeenCalledWith(entityMetadatas[0].name)
        expect(repository.clear).toHaveBeenCalled()
      })
    })
  })
})
