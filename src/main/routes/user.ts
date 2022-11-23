import * as express from 'express'

import { createUserMw, deleteUserMw, getAllUsersMw, getUserByIdMw } from '../middlewares/user'
import { toExpressMw } from '../utils/helper'

const router = express.Router()

router.post('/', toExpressMw(createUserMw))
router.get('/', toExpressMw(getAllUsersMw))
router.get('/:userId', toExpressMw(getUserByIdMw))
router.delete('/:userId', toExpressMw(deleteUserMw))

export = router
