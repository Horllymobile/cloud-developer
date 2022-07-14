import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DeleteItemInput, DocumentClient, GetItemInput } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
// import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const params = {
            TableName: this.todosTable,
            indexName: this.todosCreatedAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }
        const result = await this.docClient.query(params).promise()
        const items = result.Items
        logger.info('Getting Todos', {
            items
        })
        return items as TodoItem[]
    }

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
        const params: GetItemInput = {
            TableName: this.todosTable,
            Key: {
                "todoId": {
                    "S": todoId
                },
                "userId": {
                    "S": userId
                }
            }
        }
        const item = await this.docClient.get(params).promise();
        logger.info('Getting Todo', {
            item
        })

        return 
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Created Todo', {
            todo
        })
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    async updateTodo(todo: UpdateTodoRequest, todoId: string, userId: string) {
        const item = await this.getTodo(todoId, userId);
        if (!item) throw new Error("No Item");
        logger.error('Todo not found', {
            todoId,
            userId
        })
        const params = {
            TableName: this.todosTable,
            Key: {
                "todoId": {
                    "S": todoId
                },
                "userId": {
                    "S": userId
                }
            },
            UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done
            }
        };
        logger.info('Todo Updated', {
            todoId,
            userId
        })
        await this.docClient.update(params).promise()
        return todo
    }

    async deleteTodo(todoId: string, userId: string) {
        const item = await this.getTodo(todoId, userId);
        logger.error('Todo not found', {
            todoId,
            userId
        })
        if (!item) throw new Error("No Item");

        const params: DeleteItemInput = {
            TableName: this.todosTable,
            Key: {
                "todoId": {
                    "S": todoId
                },
                "userId": {
                    "S": userId
                }
            }
        }
        logger.error('Todo deleted', {
            todoId,
            userId
        })
        return await this.docClient.delete(params).promise();
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}