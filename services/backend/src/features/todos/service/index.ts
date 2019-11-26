import { inject, injectable } from 'tsyringe';

import { UUID } from '../../../lib/utils/uuid';
import build from '../factory';
import { ITodo } from '../model';
import TodoProvider from '../provider';
import { TodoNotFoundError } from './errors';

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

    public createTodo(label: string, done: boolean = false): Promise<ITodo> {
        const todo: ITodo = build({
            label,
            done,
        });

        return this.provider.create(todo);
    }

    public async updateTodo(todo: ITodo, label?: string, done?: boolean): Promise<ITodo> {
        return this.provider.update(todo, label, done);
    }

    public async deleteTodo(todo: ITodo): Promise<void> {
        return this.provider.delete(todo);
    }
}
