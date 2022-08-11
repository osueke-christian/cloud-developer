import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todoService'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todo_api')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const startTime = Date.now();
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId
    const result = await deleteTodo(userId, todoId);
    
    logger.info(`/todo/${todoId} [Delete] todo latency - ${Date.now() - startTime}ms`);
    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
