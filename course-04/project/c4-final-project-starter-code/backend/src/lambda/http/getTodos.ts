import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
// import * as AWS  from 'aws-sdk'

import { createLogger } from '../../utils/logger'


const logger = createLogger('createTodo')

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getting TODO item', { event })
    try {
      const userId = getUserId(event)
      const todos = await getTodosForUser(userId);
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      };
    } catch (error) {
      logger.error('Error: ', error)
      throw new Error(error);
    }
  })

handler.use(
  cors({
    credentials: true
  })
)
