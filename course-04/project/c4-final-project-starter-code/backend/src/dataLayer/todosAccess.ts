import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { Types } from 'aws-sdk/clients/s3';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new AWS.DynamoDB.DocumentClient()
}

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly s3BucketName = process.env.S3_BUCKET_NAME
  ){}

  /**
   * Get all created todo items
   * @param userId 
   * @returns 
   */
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const params = {
        TableName: this.todosTable,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
            "#userId": "userId"
        },
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };

    const result = await this.docClient.query(params).promise();
    const items = result.Items;

    return items as TodoItem[];
  }

  /**
   * Create a new Todo item
   * @param todoItem 
   * @returns 
   */
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    console.log("Creating new todo");

    const params = {
        TableName: this.todosTable,
        Item: todoItem,
    };

    await this.docClient.put(params).promise();

    return todoItem as TodoItem;
  }

  /**
   * Update an existing todo item
   * @param userId 
   * @param todoId 
   * @param todoUpdate 
   * @returns 
   */
  async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
    console.log("Updating todo");

    const params = {
        TableName: this.todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
        UpdateExpression: "set #a = :a, #b = :b, #c = :c",
        ExpressionAttributeNames: {
            "#a": "name",
            "#b": "dueDate",
            "#c": "done"
        },
        ExpressionAttributeValues: {
            ":a": todoUpdate['name'],
            ":b": todoUpdate['dueDate'],
            ":c": todoUpdate['done']
        },
        ReturnValues: "ALL_NEW"
    };

    const result = await this.docClient.update(params).promise();
    const attributes = result.Attributes;

    return attributes as TodoUpdate;
  }

  /**
   * Delete an existing todo item
   * @param userId 
   * @param todoId 
   * @returns 
   */
  async deleteToDo(userId: string, todoId: string): Promise<void> {
    console.log("Deleting todo");

    const params = {
        TableName: this.todosTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
    };

    await this.docClient.delete(params).promise();

    return;
  }


  /**
   * Generate S3 Image Upload URL
   * @param todoId 
   * @returns 
   */
  async generateUploadUrl(todoId: string): Promise<string> {
    console.log("Generating URL");

    const url = this.s3Client.getSignedUrl('putObject', {
        Bucket: this.s3BucketName,
        Key: todoId,
        Expires: 1000,
    });
    
    return url;
  }
}

