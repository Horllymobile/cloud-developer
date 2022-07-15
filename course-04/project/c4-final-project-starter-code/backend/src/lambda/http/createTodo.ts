import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import Ajv from 'ajv'

const ajv = new Ajv()
const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Creating TODO item', { todo: JSON.parse(event.body) })
    try {
      const data = JSON.parse(event.body)
      const valid = ajv.validate(schema, data)
      if (!valid) {
        logger.error('VALIDATION', ajv.errors)
        throw new Error(ajv.errors.toString())
      }
      const newTodo: CreateTodoRequest = data

      const userId = getUserId(event)

      const todo = await createTodo(newTodo, userId)

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: todo
        })
      }
    } catch (error) {
      logger.error('Error: ', error)
      throw new Error(error)
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    dueDate: {
      type: 'string'
    }
  },
  required: ['name', 'dueDate'],
  additionalProperties: false
}
