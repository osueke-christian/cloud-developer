import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

const logger = createLogger('todo_api')

import { generateUploadUrl } from '../../businessLogic/todoService'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const startTime = Date.now();
    const todoId = event.pathParameters.todoId
    const result = await generateUploadUrl(todoId);

    logger.info(`/todos/${todoId}/attachment [POST] todo attachment latency - ${Date.now() - startTime}ms`);
    return {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        "uploadUrl": result
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
