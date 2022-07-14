import { TodosAccess } from './todosAcess'
import { createAttachmentPresignedUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { parseUserId } from '../auth/utils'

const imagesBucketName = process.env.IMAGES_S3_BUCKET

const todoAccess = new TodosAccess();

// TODO: Implement businessLogic
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(userId);
}


export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    ...createTodoRequest,
    todoId: itemId,
    userId: userId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${imagesBucketName}.s3.amazonaws.com/${itemId}`
  })
}

export async function updateTodo(
  updateTodo: UpdateTodoRequest,
  todoId: string,
  userId: string,
) {
  return await todoAccess.updateTodo(updateTodo, todoId, userId)
}

export async function deleteTodo(
  todoId: string,
  userId: string,
) {
  return await todoAccess.deleteTodo(todoId, userId)
}

export async function getUploadUrl(todoId: string) {
  return createAttachmentPresignedUrl(todoId);
}