import { Response } from 'got'

import { userModel } from '../../main/db/models'
import { GotResponse } from '../types/e2e-utils'
import { client } from './utils/client-helper'
import { expectResponse } from './utils/e2e-helper'
import { e2eServer } from './utils/e2e-server'

describe('User e2e tests', () => {
  beforeAll(async () => e2eServer.start())
  afterAll(() => e2eServer.stop())
  afterEach(async () => {
    await userModel.clean()
  })
  const wrongId = 42
  describe('create user', () => {
    it('should respond and create User', async () => {
      const res: Response = await client.post('user', {
        json: {
          input: {
            age: 24,
            email: 'email@gmail.com',
            password: 'Password123@',
            username: 'jdoe',
          },
        },
      })
      const userCreated = await userModel.getOneByEmail('email@gmail.com')
      expectResponse(res, 200)
      expect(userCreated).not.toBe(null)
    })
    it('should respond with 500 given wrong input', async () => {
      const res: Response = await client.post('user', {
        json: {
          input: {
            age: 24,
            email: 'email@gmail.com',
            password: 123,
            username: 'jdoe',
          },
        },
      })
      expectResponse(res, 500)
    })
  })
  describe('getAllUsers', () => {
    it('should respond and fetch all users', async () => {
      // Given
      const expectedUsers = [
        {
          age: 24,
          email: 'email@gmail.com',
          password: 'password',
          username: 'jdoe',
        },
      ]
      const user = await userModel.create(expectedUsers[0])
      // When
      const res: GotResponse = await client('user')
      // Then
      expectResponse(res, 200, [user])
    })
  })

  describe('getUserById', () => {
    it('should retrieve user with given id', async () => {
      // Given
      const userInput = {
        age: 24,
        email: 'email@gmail.com',
        password: 'password',
        username: 'jdoe',
      }
      const user = await userModel.create(userInput)
      // When
      const res: Response = await client(`user/${user.id}`)
      // Then
      expectResponse(res, 200, user)
    })
    it('should return a 400 response with wrong ID given', async () => {
      const res: Response = await client(`user/${wrongId}`)
      expectResponse(res, 400)
    })
  })

  describe('delete user', () => {
    it('should delete user', async () => {
      // Given
      const userToCreate = {
        age: 24,
        email: 'email@gmail.com',
        password: 'password',
        username: 'jdoe',
      }
      const user = await userModel.create(userToCreate)
      // When
      const res: Response = await client.delete(`user/${user.id}`)
      expectResponse(res, 200)
    })
    it('should respond with 400 given wrong id', async () => {
      const res: Response = await client.delete(`user/${wrongId}`)
      expectResponse(res, 400)
    })
  })
})
