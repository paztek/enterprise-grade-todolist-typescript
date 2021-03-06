import { boundMethod } from 'autobind-decorator';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../../lib/utils/uuid';
import { Todo } from '../model';
import TodoService from '../service';
import { TodoInvalidError } from '../service/errors';
import { TodoHTTPBadRequestError, TodoHTTPNotFoundError } from './errors';

export interface ITodoRequest extends Request {
    todo: Todo;
}

export interface ITodoCreateRequest extends Request {
    body: {
        label: string;
        done?: boolean;
        tags?: string[];
    };
}

export interface ITodoUpdateRequest extends ITodoRequest {
    body: {
        label?: string;
        done?: boolean;
        tags?: string[];
    };
}

@injectable()
export default class TodoController {

    constructor(
        @inject(TodoService) private readonly service: TodoService,
    ) {}

    @boundMethod
    public async fetch(req: ITodoRequest, res: Response, next: NextFunction, todoId: UUID): Promise<void> {
        const todo = await this.service.getTodo(todoId);

        if (!todo) {
            throw new TodoHTTPNotFoundError(todoId);
        }

        req.todo = todo;

        return next();
    }

    @boundMethod
    public async index(req: Request, res: Response): Promise<Response> {
        const todos = await this.service.getTodos();

        return res.json(todos);
    }

    @boundMethod
    public async create(req: ITodoCreateRequest, res: Response): Promise<Response> {
        const { label, done, tags } = req.body;

        try {
            const todo = await this.service.createTodo(label, done, tags);
            return res.status(201).json(todo);
        } catch (err) {
            if (err instanceof TodoInvalidError) {
                err = new TodoHTTPBadRequestError(err.message, err.errors);
            }

            throw err;
        }
    }

    @boundMethod
    public async read(req: ITodoRequest, res: Response): Promise<Response> {
        return res.json(req.todo);
    }

    @boundMethod
    public async update(req: ITodoUpdateRequest, res: Response): Promise<Response> {
        const { label, done, tags } = req.body;

        let todo = req.todo;

        try {
            todo = await this.service.updateTodo(todo, label, done, tags);
            return res.status(200).json(todo);
        } catch (err) {
            if (err instanceof TodoInvalidError) {
                err = new TodoHTTPBadRequestError(err.message, err.errors);
            }

            throw err;
        }
    }

    @boundMethod
    public async delete(req: ITodoRequest, res: Response): Promise<Response> {
        const todo = req.todo;
        await this.service.deleteTodo(todo);

        return res.status(204).send();
    }

}
