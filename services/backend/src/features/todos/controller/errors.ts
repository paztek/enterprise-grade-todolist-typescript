import { HTTPNotFoundError } from '../../../lib/http/errors';
import { UUID } from '../../../lib/utils/uuid';

export class TodoHTTPNotFoundError extends HTTPNotFoundError {
    constructor(todoId: UUID) {
        super(`Todo ${todoId} not found`);
    }
}
