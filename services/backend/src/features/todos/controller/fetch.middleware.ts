import { NextFunction, Request, RequestParamHandler, Response } from 'express';

import { UUID } from '../../../lib/utils/uuid';
import { PersistedTodo } from '../model/todo';
import TodoService from '../service';
import { TodoHTTPNotFoundError } from './errors';

export interface ITodoRequest extends Request {
    todo: PersistedTodo;
}

export default function createMiddleware(service: TodoService): RequestParamHandler {
    return async (req: ITodoRequest, res: Response, next: NextFunction, todoId: UUID): Promise<void> => {
        const todo = await service.getTodo(todoId);

        if (!todo) {
            throw new TodoHTTPNotFoundError(todoId);
        }

        req.todo = todo;

        return next();
    };
}
