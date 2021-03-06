import { inject, injectable } from 'tsyringe';

import { Todo } from '../../model';
import { IComment } from '../model';
import CommentProvider from '../provider';

@injectable()
export default class CommentService {

    constructor(
        @inject(CommentProvider) private readonly provider: CommentProvider,
    ) {}

    public async getList(todo: Todo): Promise<IComment[]> {
        return this.provider.findAll(todo);
    }
}
