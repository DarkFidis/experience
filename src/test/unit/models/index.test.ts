import { when } from 'jest-when'

describe('models index', () => {
  let model: jest.Mock
  let userSchema: jest.Mock
  beforeAll(() => {
    jest.doMock('mongoose')
    ;({ model } = require('mongoose'))
    jest.doMock('../../../main/models/user.schema')
    ;({ userSchema } = require('../../../main/models/user.schema'))
  })
  it('should export Mongoose models', () => {
    // Given
    const userModelMock = jest.fn()
    when(model).calledWith('User', userSchema).mockReturnValue(userModelMock)
    // When
    const { userModel } = require('../../../main/models')
    expect(userModel).toEqual(userModelMock)
  })
})
