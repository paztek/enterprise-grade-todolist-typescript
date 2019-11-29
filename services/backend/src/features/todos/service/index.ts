import { inject, injectable } from 'tsyringe';

import { InvalidResourceError } from '../../../lib/provider/errors';
import { logError } from '../../../lib/utils/logging/error';
import { UUID } from '../../../lib/utils/uuid';
import { ILogger } from '../../../logger';
import build from '../factory';
import { ITodo } from '../model';
import TodoProvider from '../provider';
import { TodoInvalidError, TodoNotFoundError } from './errors';

@injectable()
export default class TodoService {

    constructor(
        @inject(TodoProvider) private readonly provider: TodoProvider,
        @inject('logger') private readonly logger: ILogger,
    ) {}

    public async getTodo(id: UUID): Promise<ITodo | null> {
        const todo = await this.provider.findOne(id);

        if (!todo) {
            throw new TodoNotFoundError(id);
        }

        return todo;
    }

    public getTodos(): Promise<ITodo[]> {
        return this.provider.findAll();
    }

    @logError()
    public async createTodo(label: string, done: boolean = false): Promise<ITodo> {
        const todo: ITodo = build({
            label,
            done,
        });

        try {
            return await this.provider.create(todo);
        } catch (err) {
            if (err instanceof InvalidResourceError) {
                err = new TodoInvalidError('Invalid data', err.errors);
            }

            throw err;
        }
    }

    @logError()
    public async updateTodo(todo: ITodo, label?: string, done?: boolean): Promise<ITodo> {
        try {
            return await this.provider.update(todo, label, done);
        } catch (err) {
            if (err instanceof InvalidResourceError) {
                err = new TodoInvalidError('Invalid data', err.errors);
            }

            throw err;
        }
    }

    public async deleteTodo(todo: ITodo): Promise<void> {
        return this.provider.delete(todo);
    }
}
