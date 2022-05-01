import { Response } from "got";
import { e2eServer } from "./utils/e2e-server";
import { client } from './utils/client-helper'
import { expectResponse } from './utils/e2e-helper'

describe('e2e tests', () => {
  beforeAll(() => e2eServer.start())
  afterAll(() => e2eServer.stop())
  describe('ping', () => {
    test('should respond to GET /ping', async () => {
      // When
      const res: Response = await client('ping')
      // Then
      expectResponse(res, 204, null)
    })
  })
})
