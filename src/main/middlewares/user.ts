import { BadRequestError } from '../errors/bad-request-error'
import { InternalError } from '../errors/internal-error'
import { User } from '../models/user.model'
import { RequestAsyncHandler } from '../types/middlewares'

export const createUserMw: RequestAsyncHandler = async (req, res) => {
  const { input } = req.body

  try {
    await User.create(input)
    res.json({ message: 'User created', success: true })
  } catch (err: any) {
    throw new InternalError(err.message as string)
  }
}

export const getAllUsersMw: RequestAsyncHandler = async (_, res) => {
  const fetchedUsers = await User.find()
  const users = fetchedUsers.map((user) => {
    const { _id, email, firstName, lastName, password } = user
    return {
      email,
      firstName,
      id: _id,
      lastName,
      password,
    }
  })
  res.json(users)
}

export const getUserByIdMw: RequestAsyncHandler = async (req, res) => {
  const { userId } = req.params
  const fetchedUser = await User.findById(userId)
  if (!fetchedUser) {
    throw new BadRequestError('User not found')
  }
  const { email, firstName, _id, lastName, password } = fetchedUser
  const user = {
    email,
    firstName,
    id: _id,
    lastName,
    password,
  }
  res.json(user)
}

export const deleteUserMw: RequestAsyncHandler = async (req, res) => {
  const { userId } = req.params
  const userToDelete = await User.findById(userId)
  if (!userToDelete) {
    throw new BadRequestError('User does not exists')
  }
  try {
    await User.deleteOne({ _id: userId })
    res.json({ success: true })
  } catch (err: any) {
    throw new InternalError(err.message as string)
  }
}
