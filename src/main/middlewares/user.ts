import { userModel } from '../db/models'
import { BadRequestError } from '../errors/bad-request-error'
import { InternalError } from '../errors/internal-error'
import { RequestAsyncHandler } from '../types/middlewares'
import { hashPassword } from '../utils/user.utils'

export const createUserMw: RequestAsyncHandler = async (req, res) => {
  const { input } = req.body
  const { password, ...userInput } = input
  const hashedPassword = await hashPassword(password as string)
  try {
    await userModel.create({
      password: hashedPassword,
      ...userInput,
    })
    res.json({ message: 'User created', success: true })
  } catch (err: any) {
    throw new InternalError(err.message as string)
  }
}

export const getAllUsersMw: RequestAsyncHandler = async (_, res) => {
  const users = await userModel.getAll()
  res.json(users)
}

export const getUserByIdMw: RequestAsyncHandler = async (req, res) => {
  const { userId } = req.params
  const user = await userModel.getById(+userId)
  if (!user) {
    throw new BadRequestError('User not found')
  }
  res.json(user)
}

export const deleteUserMw: RequestAsyncHandler = async (req, res) => {
  const { userId } = req.params
  const userToDelete = await userModel.getById(+userId)
  if (!userToDelete) {
    throw new BadRequestError('User does not exists')
  }
  try {
    await userModel.deleteById(+userId)
    res.json({ success: true })
  } catch (err: any) {
    throw new InternalError(err.message as string)
  }
}
