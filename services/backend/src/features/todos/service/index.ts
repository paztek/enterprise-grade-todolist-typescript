import { inject, injectable } from 'tsyringe';

import { InvalidResourceError } from '../../../lib/provider/errors';
import { UUID } from '../../../lib/utils/uuid';
import build from '../factory';
import { ITodo } from '../model';
import TodoProvider from '../provider';
import { TodoInvalidError, TodoNotFoundError } from './errors';

@injectable()
export default class TodoService {

    constructor(
        @inject(TodoProvider) private readonly provider: TodoProvider,
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

    public async updateTodo(todo: ITodo, label?: string, done?: boolean): Promise<ITodo> {
        return this.provider.update(todo, label, done);
    }

    public async deleteTodo(todo: ITodo): Promise<void> {
        return this.provider.delete(todo);
    }
}
