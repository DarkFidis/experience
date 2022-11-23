import { when } from 'jest-when'

import { RequestAsyncHandler } from '../../../main/types/middlewares'

describe('user router unit test', () => {
  let express
  let toExpressMw: jest.Mock
  let createUserMw: jest.Mocked<RequestAsyncHandler>
  let getAllUsersMw: jest.Mocked<RequestAsyncHandler>
  let getUserByIdMw: jest.Mocked<RequestAsyncHandler>
  let deleteUserMw: jest.Mocked<RequestAsyncHandler>
  const routerMock = {
    delete: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  }
  beforeAll(() => {
    jest.doMock('express', () => ({
      Router: jest.fn(),
    }))
    express = require('express')
    jest.doMock('../../../main/middlewares/user')
    ;({
      createUserMw,
      deleteUserMw,
      getAllUsersMw,
      getUserByIdMw,
    } = require('../../../main/middlewares/user'))
    jest.doMock('../../../main/utils/helper')
    ;({ toExpressMw } = require('../../../main/utils/helper'))
  })
  it('should export a router', () => {
    // Given
    const createUserExpressMw = jest.fn()
    const getAllUsersExpressMw = jest.fn()
    const getUserByIdExpressMw = jest.fn()
    const deleteUserExpressMw = jest.fn()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    when(express.Router).calledWith().mockReturnValue(routerMock)
    when(toExpressMw).calledWith(createUserMw).mockReturnValue(createUserExpressMw)
    when(toExpressMw).calledWith(getAllUsersMw).mockReturnValue(getAllUsersExpressMw)
    when(toExpressMw).calledWith(getUserByIdMw).mockReturnValue(getUserByIdExpressMw)
    when(toExpressMw).calledWith(deleteUserMw).mockReturnValue(deleteUserExpressMw)
    // When
    const result = require('../../../main/routes/user')
    // Then
    expect(express.Router).toHaveBeenCalled()
    expect(routerMock.post).toHaveBeenCalledWith('/', createUserExpressMw)
    expect(routerMock.get).toHaveBeenNthCalledWith(1, '/', getAllUsersExpressMw)
    expect(routerMock.get).toHaveBeenNthCalledWith(2, '/:userId', getUserByIdExpressMw)
    expect(routerMock.delete).toHaveBeenCalledWith('/:userId', deleteUserExpressMw)
    expect(result).toBeTruthy()
  })
})
