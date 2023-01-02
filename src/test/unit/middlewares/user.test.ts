import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'
import { when } from 'jest-when'

import { BadRequestError } from '../../../main/errors/bad-request-error'
import { InternalError } from '../../../main/errors/internal-error'
import { UserModel } from '../../../main/types/models'
import { expectPromiseToReject } from '../../jest-helper'

describe('User middlewares unit tests', () => {
  let req: Request
  let res: Response
  let userModel: jest.Mocked<UserModel>
  let createUserMw
  let getAllUsersMw
  let getUserByIdMw
  let deleteUserMw
  beforeAll(() => {
    req = new Request()
    res = new Response()
    jest.doMock('../../../main/models', () => ({
      userModel: {
        create: jest.fn(),
        deleteOne: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
      },
    }))
    ;({ userModel } = require('../../../main/models'))
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
      const userToCreate = {
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
      }
      req.body = {
        input: userToCreate,
      }
      const newUser = {
        id: 'user_id',
        ...userToCreate,
      }
      // @ts-ignore
      when(userModel.create).calledWith(userToCreate).mockResolvedValue(newUser)
      // When
      await createUserMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.create).toHaveBeenCalledWith(userToCreate)
      expect(res.json).toHaveBeenCalledWith({ message: 'User created', success: true })
    })
    it('should throw an Internal error if user creation fails', async () => {
      // Given
      const userToCreate = {
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
      }
      const error = new Error('oops')
      const expectedError = new InternalError(error.message)
      // @ts-ignore
      when(userModel.create).calledWith(userToCreate).mockRejectedValue(error)
      // When
      const promise: Promise<void> = createUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      // Test du call de User.create
    })
  })
  describe('getAllUsersMw', () => {
    it('should retrieve all users', async () => {
      // Given
      const users = [
        {
          _id: 'user_id',
          email: 'email@gmail.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'password',
        },
      ]
      const expectedResult = [
        {
          email: 'email@gmail.com',
          firstName: 'John',
          id: 'user_id',
          lastName: 'Doe',
          password: 'password',
        },
      ]
      when(userModel.find).calledWith().mockResolvedValue(users)
      // When
      await getAllUsersMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.find).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(expectedResult)
    })
    it('should return an empty array if no users', async () => {
      // Given
      when(userModel.find).calledWith().mockResolvedValue([])
      // When
      await getAllUsersMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.find).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith([])
    })
  })
  describe('getUserById', () => {
    it('should retrieve all users', async () => {
      const userId = 'user_id'
      req.params = {
        userId,
      }
      // Given
      const user = {
        _id: userId,
        email: 'email@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
      }
      const expectedUser = {
        email: 'email@gmail.com',
        firstName: 'John',
        id: userId,
        lastName: 'Doe',
        password: 'password',
      }
      when(userModel.findById).calledWith(userId).mockResolvedValue(user)
      // When
      await getUserByIdMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.findById).toHaveBeenCalledWith(userId)
      expect(res.json).toHaveBeenCalledWith(expectedUser)
    })
    it('should throw a BadRequestError given no user associated with given Id', async () => {
      // Given
      const userId = 'user_id'
      when(userModel.findById).calledWith(userId).mockResolvedValue(null)
      const expectedError = new BadRequestError('User not found')
      // When
      const promise: Promise<void> = getUserByIdMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.findById).toHaveBeenCalledWith(userId)
    })
  })
  describe('deleteUserMw', () => {
    it('should delete user from given ID', async () => {
      // Given
      const userId = 'user_id'
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
      when(userModel.findById).calledWith(userId).mockResolvedValue(user)
      // @ts-ignore
      when(userModel.deleteOne).calledWith({ _id: userId }).mockResolvedValue(true)
      // When
      await deleteUserMw(req as unknown as ExpressRequest, res as unknown as ExpressResponse)
      // Then
      expect(userModel.findById).toHaveBeenCalledWith(userId)
      expect(userModel.deleteOne).toHaveBeenCalledWith({ _id: userId })
    })
    it('should throw a BadRequest error if no User matches given Id', async () => {
      // Given
      const userId = 'user_id'
      req.params = {
        userId,
      }
      when(userModel.findById).calledWith(userId).mockResolvedValue(null)
      const expectedError = new BadRequestError('User does not exists')
      // When
      const promise: Promise<void> = deleteUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.findById).toHaveBeenCalledWith(userId)
    })
    it('should throw an Internal error if user deletion fails', async () => {
      // Given
      const userId = 'user_id'
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
      when(userModel.findById).calledWith(userId).mockResolvedValue(user)
      const error = new Error('oops')
      // @ts-ignore
      when(userModel.deleteOne).calledWith({ _id: userId }).mockRejectedValue(error)
      const expectedError = new InternalError(error.message)
      // When
      const promise: Promise<void> = deleteUserMw(
        req as unknown as ExpressRequest,
        res as unknown as ExpressResponse,
      )
      // Then
      await expectPromiseToReject(promise, expectedError)
      expect(userModel.findById).toHaveBeenCalledWith(userId)
      expect(userModel.deleteOne).toHaveBeenCalledWith({ _id: userId })
    })
  })
})
