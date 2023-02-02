import { when } from 'jest-when'
import { Repository } from 'typeorm'

import { Customer } from '../../../../main/db/entities/User'
import { UserModel } from '../../../../main/db/models/user.model'

describe('User model unit tests', () => {
  let userModel
  const entityMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  } as unknown as Repository<Customer>
  describe('instance', () => {
    beforeEach(() => {
      userModel = new UserModel(entityMock)
    })
    describe('save', () => {
      let createSpy: jest.SpyInstance
      let updateSpy: jest.SpyInstance
      beforeAll(() => {
        createSpy = jest.spyOn(UserModel.prototype, 'create').mockImplementation()
        updateSpy = jest.spyOn(UserModel.prototype, 'update').mockImplementation()
      })
      afterAll(() => {
        createSpy.mockRestore()
        updateSpy.mockRestore()
      })
      it('should create an entity if input has no id', async () => {
        // Given
        const input = {
          age: 32,
          email: 'jdoe@gmail.com',
          password: 'password',
          username: 'jdoe',
        }
        const entity = {
          ...input,
          id: 1,
        }
        when(createSpy).calledWith(input).mockResolvedValue(entity)
        // When
        const result = await userModel.save(input)
        // Then
        expect(createSpy).toHaveBeenCalledWith(input)
        expect(result).toStrictEqual(entity)
      })
      it('should update an entity if input has an id', async () => {
        // Given
        const input = {
          age: 32,
          email: 'jdoe@gmail.com',
          id: 1,
          password: 'password',
          username: 'jdoe',
        }
        when(updateSpy).calledWith(input).mockResolvedValue(input)
        // When
        const result = await userModel.save(input)
        // Then
        expect(updateSpy).toHaveBeenCalledWith(input)
        expect(result).toStrictEqual(input)
      })
    })
    describe('getOneByEmail', () => {
      let getOneByOptionsSpy: jest.SpyInstance
      beforeAll(() => {
        getOneByOptionsSpy = jest.spyOn(UserModel.prototype, 'getOneByOptions').mockImplementation()
      })
      afterAll(() => {
        getOneByOptionsSpy.mockRestore()
      })
      it('should retrieve user from given email', async () => {
        // Given
        const email = 'johndoe@gmail.com'
        const user = {
          age: 32,
          email,
          id: 1,
          password: 'password',
          username: 'jdoe',
        }
        when(getOneByOptionsSpy).calledWith({ email }).mockResolvedValue(user)
        // When
        const result = await userModel.getOneByEmail(email)
        // Then
        expect(getOneByOptionsSpy).toHaveBeenCalledWith({ email })
        expect(result).toStrictEqual(user)
      })
    })
  })
})
