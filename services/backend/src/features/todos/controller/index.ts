import { boundMethod } from 'autobind-decorator';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../../lib/utils/uuid';
import { PersistedTodo, Todo } from '../model/todo';
import TodoService from '../service';
import { CommentInvalidError, TodoInvalidError } from '../service/errors';
import { CommentHTTPBadRequestError, TodoHTTPBadRequestError, TodoHTTPNotFoundError } from './errors';

interface ITodoRequest extends Request {
    todo: PersistedTodo;
}

interface ITodoCreateRequest extends Request {
    body: {
        label: string;
        done?: boolean;
        tags?: string[];
    };
}

interface ITodoUpdateRequest extends ITodoRequest {
    body: {
        label?: string;
        done?: boolean;
        tags?: string[];
    };
}

interface ITodoCreateCommentRequest extends ITodoRequest {
    body: {
        text: string;
    };
}

@injectable()
export default class TodoController {

    constructor(
        @inject(TodoService) private readonly service: TodoService,
    ) {}

    @boundMethod
    public async fetchTodo(req: ITodoRequest, res: Response, next: NextFunction, todoId: UUID): Promise<void> {
        const todo = await this.service.getTodo(todoId);

        if (!todo) {
            throw new TodoHTTPNotFoundError(todoId);
        }

        req.todo = todo;

        return next();
    }

    @boundMethod
    public async getTodos(req: Request, res: Response): Promise<Response> {
        const todos = await this.service.getTodos();

        return res.json(todos);
    }

    @boundMethod
    public async createTodo(req: ITodoCreateRequest, res: Response): Promise<Response> {
        const { label, done, tags } = req.body;

        try {
            const todo = await this.service.createTodo(label, done, tags);
            return res.status(201).json(todo);
        } catch (err) {
            if (err instanceof TodoInvalidError) {
                err = new TodoHTTPBadRequestError(err);
            }

            throw err;
        }
    }

    @boundMethod
    public async getTodo(req: ITodoRequest, res: Response): Promise<Response> {
        return res.json(req.todo);
    }

    @boundMethod
    public async updateTodo(req: ITodoUpdateRequest, res: Response): Promise<Response> {
        const { label, done, tags } = req.body;

        let todo = req.todo;

        try {
            todo = await this.service.updateTodo(todo, label, done, tags);
            return res.status(200).json(todo);
        } catch (err) {
            if (err instanceof TodoInvalidError) {
                err = new TodoHTTPBadRequestError(err);
            }

            throw err;
        }
    }

    @boundMethod
    public async deleteTodo(req: ITodoRequest, res: Response): Promise<Response> {
        const todo = req.todo;
        await this.service.deleteTodo(todo);

        return res.status(204).send();
    }

    @boundMethod
    public async createTodoComment(req: ITodoCreateCommentRequest, res: Response): Promise<Response> {
        const todo = req.todo;
        const { text } = req.body;

        try {
            const comment = await this.service.createTodoComment(todo, text);
            return res.status(201).json(comment);
        } catch (err) {
            if (err instanceof CommentInvalidError) {
                err = new CommentHTTPBadRequestError(err);
            }

            throw err;
        }
    }

}
