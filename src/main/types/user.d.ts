import { Request, Response } from 'express'
import { DeepPartial } from 'typeorm'

import { Customer } from '../db/entities/User'

export type RequestWithUserInput = Request<unknown, unknown, { input: DeepPartial<Customer> }>

export type CreateUserMw = (req: RequestWithUserInput, res: Response) => Promise<void>
