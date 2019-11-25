import { inject, injectable } from 'tsyringe';

import { UUID } from '../../lib/utils/uuid';
import { ITodo } from './model';
import TodoProvider from './provider';

@injectable()
export default class TodoService {

    constructor(
        @inject(TodoProvider) private readonly provider: TodoProvider,
    ) {}

    public async get(todoId: UUID): Promise<ITodo | null> {
        return {
            id: todoId,
            label: 'string',
            done: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }

    public getList(): Promise<ITodo[]> {
        return this.provider.findAll();
    }
}
