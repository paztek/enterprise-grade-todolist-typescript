import { NextFunction, RequestParamHandler, Response } from 'express';

import { UUID } from '../../../lib/utils/uuid';
import TodoService from '../service';
import { TodoHTTPNotFoundError } from './errors';
import { ITodoRequest } from './index';

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
