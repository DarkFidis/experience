describe('UserModel', () => {
  describe('export', () => {
    let Schema: jest.Mock
    let model: jest.Mock
    beforeAll(() => {
      jest.doMock('mongoose')
      ;({ model, Schema } = require('mongoose'))
    })
    afterAll(() => {
      jest.restoreAllMocks()
      jest.resetModules()
      jest.unmock('mongoose')
    })
    it('should export User model', () => {
      // Given
      Schema.mockReturnValue({
        index: jest.fn(), // In case of Mongo indexes use
        statics: {}, // In case of model static methods
      })
      // When
      const result = require('../../../main/models/user.model')
      // Then
      expect(Schema).toHaveBeenCalled()
      expect(model).toHaveBeenCalled()
      expect(result).toBeTruthy()
    })
  })
})
