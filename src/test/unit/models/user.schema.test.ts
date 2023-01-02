describe('UserSchema', () => {
  describe('export', () => {
    let Schema: jest.Mock
    beforeAll(() => {
      jest.doMock('mongoose')
      ;({ Schema } = require('mongoose'))
    })
    afterAll(() => {
      jest.restoreAllMocks()
      jest.resetModules()
      jest.unmock('mongoose')
    })
    it('should export User schema', () => {
      // Given
      Schema.mockReturnValue({
        index: jest.fn(), // In case of Mongo indexes use
        statics: {}, // In case of model static methods
      })
      // When
      const result = require('../../../main/models/user.schema')
      // Then
      expect(Schema).toHaveBeenCalled()
      expect(result).toBeTruthy()
    })
  })
})
