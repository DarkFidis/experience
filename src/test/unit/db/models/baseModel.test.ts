import { when } from 'jest-when'
import { Repository } from 'typeorm'

import { BaseModel } from '../../../../main/db/models/baseModel'
import { NotFoundError } from '../../../../main/errors/not-found-error'

describe('baseModel', () => {
  const entityMock = {
    create: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  } as unknown as Repository<any>
  class MyBaseModel extends BaseModel<any> {
    constructor(entity: Repository<any>) {
      super(entity)
    }
  }
  describe('instance', () => {
    let myBaseModel
    beforeEach(() => {
      myBaseModel = new MyBaseModel(entityMock)
    })
    it('should provide properties', () => {
      expect(myBaseModel.model).toStrictEqual(entityMock)
    })

    describe('getAll', () => {
      it('should return all entries', async () => {
        // Given
        const expectedResult = [
          {
            foo: 'bar',
          },
        ]
        when(entityMock.find as jest.Mock)
          .calledWith()
          .mockResolvedValue(expectedResult)
        // When
        const result = await myBaseModel.getAll()
        // Then
        expect(entityMock.find).toHaveBeenCalled()
        expect(result).toStrictEqual(expectedResult)
      })
    })

    describe('getById', () => {
      it('should return entry with ID', async () => {
        // Given
        const id = 'my_id'
        const expectedResult = [
          {
            foo: 'bar',
          },
        ]
        when(entityMock.findOneBy as jest.Mock)
          .calledWith({ id })
          .mockResolvedValue(expectedResult)
        // When
        const result = await myBaseModel.getById(id)
        // Then
        expect(entityMock.findOneBy).toHaveBeenCalledWith({ id })
        expect(result).toStrictEqual(expectedResult)
      })
    })

    describe('getOneByOptions', () => {
      it('should return entry with ID', async () => {
        // Given
        const options = {
          id: 'my_id',
        }
        const expectedResult = [
          {
            foo: 'bar',
          },
        ]
        when(entityMock.findOneBy as jest.Mock)
          .calledWith(options)
          .mockResolvedValue(expectedResult)
        // When
        const result = await myBaseModel.getOneByOptions(options)
        // Then
        expect(entityMock.findOneBy).toHaveBeenCalledWith(options)
        expect(result).toStrictEqual(expectedResult)
      })
    })

    describe('create', () => {
      it('should create an entity with given input', async () => {
        // Given
        const input = {
          age: 32,
          firstName: 'John',
          lastName: 'Doe',
        }
        const entityFromInput = {
          age: 32,
          firstName: 'John',
          id: 1,
          lastName: 'Doe',
        }
        when(entityMock.create as jest.Mock)
          .calledWith(input)
          .mockReturnValue(entityFromInput)
        when(entityMock.save as jest.Mock)
          .calledWith(entityFromInput)
          .mockResolvedValue(entityFromInput)
        // When
        const result = await myBaseModel.create(input)
        // Then
        expect(entityMock.create).toHaveBeenCalledWith(input)
        expect(entityMock.save).toHaveBeenCalledWith(entityFromInput)
        expect(result).toStrictEqual(entityFromInput)
      })
    })

    describe('update', () => {
      let getByIdSpy: jest.SpyInstance
      beforeAll(() => {
        getByIdSpy = jest.spyOn(MyBaseModel.prototype, 'getById').mockImplementation()
      })
      afterAll(() => {
        getByIdSpy.mockRestore()
      })
      afterEach(() => {
        getByIdSpy.mockClear()
      })
      it('should update given entity with new content', async () => {
        // Given
        const input = {
          age: 36,
          firstName: 'John',
          id: 'id',
          lastName: 'Doe',
        }
        const oldEntity = {
          age: 32,
          firstName: 'John',
          id: 'id',
          lastName: 'Doe',
        }
        when(getByIdSpy).calledWith(input.id).mockResolvedValue(oldEntity)
        // When
        const result = await myBaseModel.update(input)
        // Then
        expect(getByIdSpy).toHaveBeenCalledWith(input.id)
        expect(entityMock.update).toHaveBeenCalledWith(oldEntity.id, input)
        expect(result).toStrictEqual(input)
      })
      it('should throw a NotFoundError given no entity corresponding to input ID', async () => {
        // Given
        const input = {
          age: 36,
          firstName: 'John',
          id: 'id',
          lastName: 'Doe',
        }
        when(getByIdSpy).calledWith(input.id).mockResolvedValue(undefined)
        // When
        try {
          await myBaseModel.update(input)
        } catch (err: any) {
          // Then
          expect(err).toBeInstanceOf(NotFoundError)
          expect(err.message).toBe('Entity not found')
          expect(getByIdSpy).toHaveBeenCalledWith(input.id)
          expect(entityMock.update).not.toHaveBeenCalled()
        }
      })
    })

    describe('deleteById', () => {
      let getByIdSpy: jest.SpyInstance
      beforeAll(() => {
        getByIdSpy = jest.spyOn(MyBaseModel.prototype, 'getById').mockImplementation()
      })
      afterAll(() => {
        getByIdSpy.mockRestore()
      })
      afterEach(() => {
        getByIdSpy.mockClear()
      })
      it('should delete given entity from given ID', async () => {
        // Given
        const id = 1
        const entity = {
          age: 32,
          firstName: 'John',
          id: 1,
          lastName: 'Doe',
        }
        when(getByIdSpy).calledWith(id).mockResolvedValue(entity)
        when(entityMock.remove as jest.Mock)
          .calledWith(entity)
          .mockResolvedValue(entity)
        // When
        const result = await myBaseModel.deleteById(id)
        // Then
        expect(getByIdSpy).toHaveBeenCalledWith(id)
        expect(entityMock.remove).toHaveBeenCalledWith(entity)
        expect(result).toStrictEqual(entity)
      })
      it('should throw a NotFoundError given no entity corresponding to input ID', async () => {
        // Given
        const id = 1
        when(getByIdSpy).calledWith(id).mockResolvedValue(undefined)
        // When
        try {
          await myBaseModel.deleteById(id)
        } catch (err: any) {
          // Then
          expect(err).toBeInstanceOf(NotFoundError)
          expect(err.message).toBe('Entity not found')
          expect(getByIdSpy).toHaveBeenCalledWith(id)
          expect(entityMock.remove).not.toHaveBeenCalled()
        }
      })
    })
  })
})
