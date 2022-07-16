import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Updatting TODO item', { todo: event.body })
    try {
      const data = JSON.parse(event.body)
      const updatedTodo: UpdateTodoRequest = data
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      await updateTodo(updatedTodo, todoId, userId)
      return {
        statusCode: 201,
        body: JSON.stringify({})
      }
    } catch (error) {
      logger.error('Error: ', error)
      throw new Error(error)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
