import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getAllTodos } from '../../businessLogic/todoService'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('todo_api')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const startTime = Date.now();
    const userId = getUserId(event);
    const todos = await getAllTodos(userId);

    logger.info(`/todos [GET] todo latency - ${Date.now() - startTime}ms`);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            "items": todos
        }),
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
