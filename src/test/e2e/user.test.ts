import { Response } from 'got'

import { userModel } from '../../main/models'
import { GotResponse } from '../types/e2e-utils'
import { client } from './utils/client-helper'
import { expectResponse } from './utils/e2e-helper'
import { e2eServer } from './utils/e2e-server'

describe('User e2e tests', () => {
  const userId = '637e540820cc0a8b24d3526c'
  const wrongId = '637f49f0de9009b8252b6137'
  beforeAll(() => e2eServer.start())
  afterAll(() => e2eServer.stop())
  describe('create user', () => {
    it('should respond and create User', async () => {
      const res: Response = await client.post('user', {
        json: {
          input: {
            _id: userId,
            email: 'email@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'Password123@',
          },
        },
      })
      const userCreated = await userModel.findOne({ firstName: 'John', lastName: 'Doe' })
      expectResponse(res, 200)
      expect(userCreated).toBeTruthy()
    })
    it('should respond with 500 given wrong input', async () => {
      const res: Response = await client.post('user', {
        json: {
          input: {
            email: 'email@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 123,
          },
        },
      })
      expectResponse(res, 500)
    })
  })
  describe('getAllUsers', () => {
    it('should respond and fetch all users', async () => {
      // Given
      const expectedBody = [
        {
          email: 'email@gmail.com',
          firstName: 'John',
          id: userId,
          lastName: 'Doe',
          password: 'Password123@',
        },
      ]
      const res: GotResponse = await client('user')
      expectResponse(res, 200, expectedBody)
    })
  })

  describe('getUserById', () => {
    it('should retrive user with given id', async () => {
      const expectedBody = {
        email: 'email@gmail.com',
        firstName: 'John',
        id: userId,
        lastName: 'Doe',
        password: 'Password123@',
      }
      const res: Response = await client(`user/${userId}`)
      expectResponse(res, 200, expectedBody)
    })
    it('should return a 400 response with wrong ID given', async () => {
      const res: Response = await client(`user/${wrongId}`)
      expectResponse(res, 400)
    })
  })

  describe('delete user', () => {
    it('should delete user', async () => {
      const res: Response = await client.delete(`user/${userId}`)
      expectResponse(res, 200)
    })
    it('should respond with 400 given wrong id', async () => {
      const res: Response = await client.delete(`user/${wrongId}`)
      expectResponse(res, 400)
    })
  })
})
