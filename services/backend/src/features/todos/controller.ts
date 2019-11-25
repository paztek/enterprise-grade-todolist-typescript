import { boundMethod } from 'autobind-decorator';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../lib/utils/uuid';
import { TodoNotFoundError } from './errors.http';
import { ITodo } from './model';
import TodoService from './service';

export interface ITodoRequest extends Request {
    todo: ITodo;
}

@injectable()
export default class TodoController {

    constructor(
        @inject(TodoService) private readonly service: TodoService,
    ) {}

    @boundMethod
    public async fetch(req: ITodoRequest, res: Response, next: NextFunction, todoId: UUID): Promise<void> {
        const todo = await this.service.get(todoId);

        if (!todo) {
            throw new TodoNotFoundError(todoId);
        }

        req.todo = todo;

        return next();
    }

    @boundMethod
    public async index(req: Request, res: Response, next: NextFunction): Promise<Response> {
        const todos = await this.service.getList();

        return res.json(todos);
    }

    @boundMethod
    public async show(req: ITodoRequest, res: Response, next: NextFunction): Promise<Response> {
        return res.json(req.todo);
    }

}
