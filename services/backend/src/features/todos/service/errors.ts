/* tslint:disable:max-classes-per-file */
import VError from 'verror';

import { UUID } from '../../../lib/utils/uuid';

export class TodoNotFoundError extends VError {

    constructor(
        public readonly todoId: UUID,
    ) {
        super({ info: { id: todoId } }, `Todo ${todoId} not found`);
    }
}

export class TodoInvalidError extends VError {

    constructor(cause: Error) {
        super({ cause }, 'Invalid todo');
    }
}

export class CommentInvalidError extends VError {

    constructor(cause: Error) {
        super({ cause }, 'Invalid comment');
    }
}
