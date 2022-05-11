import { Request, Response } from 'express'

export const helloWorldMw = (_: Request, res: Response) => {
  res.json({ hello: 'world' })
}
