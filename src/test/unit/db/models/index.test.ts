import { when } from 'jest-when'
import { Repository } from 'typeorm'

import { PgClientable } from '../../../../main/types/pg'

describe('Models index', () => {
  let UserModel: jest.Mock
  let pgClient: jest.Mocked<PgClientable>
  let User: jest.Mock
  beforeAll(() => {
    jest.mock('../../../../main/db/models/user.model')
    ;({ UserModel } = require('../../../../main/db/models/user.model'))
    jest.doMock('../../../../main/postgres')
    ;({ pgClient } = require('../../../../main/postgres'))
    jest.doMock('../../../../main/db/entities/User')
    ;({ User } = require('../../../../main/db/entities/User'))
  })
  test('Should export all models', () => {
    // When
    const userModelMock = jest.fn()
    const userRepositoryMock = jest.fn() as unknown as Repository<any>
    when(pgClient.getRepositoryFromEntity).calledWith(User).mockReturnValue(userRepositoryMock)
    when(UserModel).calledWith(userRepositoryMock).mockReturnValue(userModelMock)
    const result = require('../../../../main/db/models')
    // Then
    expect(result).toEqual({ userModel: userModelMock })
  })
})
