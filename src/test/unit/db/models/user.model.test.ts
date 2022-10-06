import { when } from 'jest-when'

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
  }
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
          firstName: 'John',
          lastName: 'Doe',
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
          firstName: 'John',
          id: 1,
          lastName: 'Doe',
        }
        when(updateSpy).calledWith(input).mockResolvedValue(input)
        // When
        const result = await userModel.save(input)
        // Then
        expect(updateSpy).toHaveBeenCalledWith(input)
        expect(result).toStrictEqual(input)
      })
    })
  })
})
