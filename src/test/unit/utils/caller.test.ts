import { join, resolve } from 'path'

const baseDir = resolve(__dirname, '..', '..', '..')

describe('caller unit tests', () => {
  let stackback: jest.Mock
  let getCaller: jest.Mock
  beforeAll(() => {
    jest.doMock('stackback')
    stackback = require('stackback')
    ;({ getCaller } = require('../../../main/utils/caller'))
  })
  test('should return caller source filename and line number', () => {
    // Given
    const expectedResult = {
      file: 'sourcefile',
      line: 4,
    }
    const stack = [
      {
        getFileName: jest.fn(),
        getLineNumber: jest.fn(),
      },
      {
        getFileName: jest.fn(),
        getLineNumber: jest.fn(),
      },
    ]
    stack[1].getFileName.mockReturnValue(join(baseDir, expectedResult.file))
    stack[1].getLineNumber.mockReturnValue(expectedResult.line)
    stackback.mockReturnValue(stack)
    // When
    const result = getCaller(baseDir)
    // Then
    expect(result).toEqual(expectedResult)
    expect(stackback).toHaveBeenCalledWith(expect.any(Error))
  })
})
