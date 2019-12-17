import { inject, injectable } from 'tsyringe';

import { InvalidResourceError } from '../../../lib/provider/errors';
import { logError } from '../../../lib/utils/logging/error';
import { UUID } from '../../../lib/utils/uuid';
import { ILogger } from '../../../logger';
import { Tag } from '../../tags/model';
import { build as buildTodo, PersistedTodo, Todo } from '../model/todo';
import TodoProvider from '../provider';
import { TodoInvalidError, TodoNotFoundError } from './errors';
import { Comment } from '../model/comment';

@injectable()
export default class TodoService {

    constructor(
        @inject(TodoProvider) private readonly provider: TodoProvider,
        @inject('logger') private readonly logger: ILogger,
    ) {}

    public async getTodo(id: UUID): Promise<PersistedTodo> {
        const todo = await this.provider.findTodo(id);

        if (!todo) {
            throw new TodoNotFoundError(id);
        }

        return todo;
    }

    public getTodos(): Promise<PersistedTodo[]> {
        return this.provider.findTodos();
    }

    @logError()
    public async createTodo(label: string, done: boolean = false, tags: Tag[] = []): Promise<PersistedTodo> {
        const todo: Todo = buildTodo({
            label,
            done,
            tags,
        });

        try {
            return await this.provider.createTodo(todo);
        } catch (err) {
            if (err instanceof InvalidResourceError) {
                err = new TodoInvalidError('Invalid data', err.errors);
            }

            throw err;
        }
    }

    @logError()
    public async updateTodo(todo: PersistedTodo, label?: string, done?: boolean, tags: Tag[] = []): Promise<PersistedTodo> {
        try {
            if (label !== undefined) {
                todo.label = label;
            }
            if (done !== undefined) {
                todo.done = done;
            }
            if (tags !== undefined) {
                todo.tags = tags;
            }

            return await this.provider.updateTodo(todo);
        } catch (err) {
            if (err instanceof InvalidResourceError) {
                err = new TodoInvalidError('Invalid data', err.errors);
            }

            throw err;
        }
    }

    public async deleteTodo(todo: PersistedTodo): Promise<void> {
        return this.provider.deleteTodo(todo);
    }

    public async createTodoComment(todo: PersistedTodo, text: string): Promise<Comment> {
        const comment: Comment = {
            text,
        };

        return this.provider.createTodoComment(todo, comment);
    }
}
