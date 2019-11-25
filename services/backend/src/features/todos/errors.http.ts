import { HTTPNotFoundError } from '../../lib/http/errors';
import { UUID } from '../../lib/utils/uuid';

export class TodoNotFoundError extends HTTPNotFoundError {
    constructor(todoId: UUID) {
        super(`Todo ${todoId} not found`);
    }
}
