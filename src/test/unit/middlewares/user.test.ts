import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'
import { when } from 'jest-when'

import { UserModel } from '../../../main/db/models/user.model'
import { BadRequestError } from '../../../main/errors/bad-request-error'
import { InternalError } from '../../../main/errors/internal-error'
import { expectPromiseToReject } from '../../jest-helper'

describe('User middlewares unit tests', () => {
  let req: Request
  let res: Response
  let userModel: jest.Mocked<UserModel>
  let createUserMw
  let getAllUsersMw
  let getUserByIdMw
  let deleteUserMw
  let hashPassword: jest.Mock
  beforeAll(() => {
    req = new Request()
    res = new Response()
    jest.doMock('../../../main/db/models', () => ({
      userModel: {
        create: jest.fn(),
        deleteById: jest.fn(),
        getAll: jest.fn(),
        getById: jest.fn(),
      },
    }))
    ;({ userModel } = require('../../../main/db/models'))
    jest.doMock('../../../main/utils/user.utils')
    ;({ hashPassword } = require('../../../main/utils/user.utils'))
    ;({
      createUserMw,
      getAllUsersMw,
      getUserByIdMw,
      deleteUserMw,
    } = require('../../../main/middlewares/user'))
  })
  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('createUserMw', () => {
    it('should create a new user', async () => {
      // Given
      const password = 'password'
      const hashedPassword = 'hashedPassword'
      const userInput = {
        age: 21,
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password,
      }
      const userToCreate = {
        age: 21,
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
      }
      req.body = {
        input: userInput,
      }
      const newUser = {
        id: 'user_id',
        ...userToCreate,
      }
      // @ts-ignore
      when(userModel.create).calledWith(userToCreate).mockResolvedValue(newUser)
      when(hashPassword).calledWith(password).mockResolvedValue(hashedPassword)
      // When
      await createUserMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(hashPassword).toHaveBeenCalledWith(password)
      expect(userModel.create).toHaveBeenCalledWith(userToCreate)
      expect(res.json).toHaveBeenCalledWith({ message: 'User created', success: true })
    })
    it('should throw an Internal error if user creation fails', async () => {
      // Given
      const password = 'password'
      const hashedPassword = 'hashedPassword'
      const userBaseInfos = {
        age: 21,
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
      }
      const userInput = {
        password,
        ...userBaseInfos,
      }
      const userToCreate = {
        ...userBaseInfos,
        password: hashedPassword,
      }
      req.body = {
        input: userInput,
      }
      const error = new Error('oops')
      const expectedError = new InternalError(error.message)
      // @ts-ignore
      when(hashPassword).calledWith(password).mockResolvedValue(hashedPassword)
      when(userModel.create).calledWith(userToCreate).mockRejectedValue(error)
      // When
      const promise: Promise<void> = createUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(hashPassword).toHaveBeenCalledWith(password)
      expect(userModel.create).toHaveBeenCalledWith(userToCreate)
    })
  })
  describe('getAllUsersMw', () => {
    it('should retrieve all users', async () => {
      // Given
      const users = [
        {
          email: 'email@gmail.com',
          firstName: 'John',
          id: 'user_id',
          lastName: 'Doe',
          password: 'password',
        },
      ]
      when(userModel.getAll).calledWith().mockResolvedValue(users)
      // When
      await getAllUsersMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.getAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(users)
    })
    it('should return an empty array if no users', async () => {
      // Given
      when(userModel.getAll).calledWith().mockResolvedValue([])
      // When
      await getAllUsersMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.getAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith([])
    })
  })
  describe('getUserById', () => {
    it('should retrieve all users', async () => {
      const userId = 1
      req.params = {
        userId,
      }
      // Given
      const user = {
        email: 'email@gmail.com',
        firstName: 'John',
        id: userId,
        lastName: 'Doe',
        password: 'password',
      }
      when(userModel.getById).calledWith(userId).mockResolvedValue(user)
      // When
      await getUserByIdMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.getById).toHaveBeenCalledWith(userId)
      expect(res.json).toHaveBeenCalledWith(user)
    })
    it('should throw a BadRequestError given no user associated with given Id', async () => {
      // Given
      const userId = 1
      when(userModel.getById).calledWith(userId).mockResolvedValue(null)
      const expectedError = new BadRequestError('User not found')
      // When
      const promise: Promise<void> = getUserByIdMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.getById).toHaveBeenCalledWith(userId)
    })
  })
  describe('deleteUserMw', () => {
    it('should delete user from given ID', async () => {
      // Given
      const userId = 1
      req.params = {
        userId,
      }
      const user = {
        email: 'email@gmail.com',
        firstName: 'John',
        id: userId,
        lastName: 'Doe',
        password: 'password',
      }
      when(userModel.getById).calledWith(userId).mockResolvedValue(user)
      // @ts-ignore
      when(userModel.deleteById).calledWith(userId).mockResolvedValue(true)
      // When
      await deleteUserMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.getById).toHaveBeenCalledWith(userId)
      expect(userModel.deleteById).toHaveBeenCalledWith(userId)
    })
    it('should throw a BadRequest error if no User matches given Id', async () => {
      // Given
      const userId = 1
      req.params = {
        userId,
      }
      when(userModel.getById).calledWith(userId).mockResolvedValue(null)
      const expectedError = new BadRequestError('User does not exists')
      // When
      const promise: Promise<void> = deleteUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.getById).toHaveBeenCalledWith(userId)
    })
    it('should throw an Internal error if user deletion fails', async () => {
      // Given
      const userId = 1
      req.params = {
        userId,
      }
      const user = {
        email: 'email@gmail.com',
        firstName: 'John',
        id: userId,
        lastName: 'Doe',
        password: 'password',
      }
      when(userModel.getById).calledWith(userId).mockResolvedValue(user)
      const error = new Error('oops')
      // @ts-ignore
      when(userModel.deleteById).calledWith(userId).mockRejectedValue(error)
      const expectedError = new InternalError(error.message)
      // When
      const promise: Promise<void> = deleteUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.getById).toHaveBeenCalledWith(userId)
      expect(userModel.deleteById).toHaveBeenCalledWith(userId)
    })
  })
})
