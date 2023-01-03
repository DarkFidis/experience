import { when } from 'jest-when'
import { DataSourceOptions } from 'typeorm'
import { Logger } from 'winston'

import { PgClientable } from '../../main/types/pg'

describe('postgres', () => {
  let log: jest.Mocked<Logger>
  let PgClient: jest.Mock
  let User
  beforeAll(() => {
    jest.doMock('../../main/services/pg-client')
    ;({ PgClient } = require('../../main/services/pg-client'))
    jest.doMock('../../main/log')
    ;({ log } = require('../../main/log'))
    jest.doMock('../../main/db/entities/User')
    ;({ User } = require('../../main/db/entities/User'))
    process.env = {
      DB_PASSWORD: 'test',
      DB_USER: 'test',
      NODE_ENV: 'test',
    }
  })
  afterAll(() => {
    jest.resetModules()
  })
  it('should create an instance of PG client', () => {
    // Given
    const dbOptions: DataSourceOptions = {
      database: 'express-template-test',
      entities: [User],
      host: 'localhost',
      logging: false,
      password: process.env.DB_PASSWORD,
      port: 5432,
      synchronize: true,
      type: 'postgres',
      username: process.env.DB_USER,
    }
    const pgClient = {
      init: jest.fn(),
    } as unknown as jest.Mocked<PgClientable>
    when(PgClient).calledWith(log, dbOptions).mockReturnValue(pgClient)
    // When
    const result = require('../../main/postgres')
    // Then
    expect(PgClient).toHaveBeenNthCalledWith(1, log, dbOptions)
    expect(result).toHaveProperty('pgClient', pgClient)
  })
})
