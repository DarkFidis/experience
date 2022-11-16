import { mongo as config } from './config'
import { log } from './log'
import { MongoClient } from './services/mongo-client'
import { MongoClientable } from './types/mongo'

const mongoClient: MongoClientable = new MongoClient(log, config)

export { mongoClient }
