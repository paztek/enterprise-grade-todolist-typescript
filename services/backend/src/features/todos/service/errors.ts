import { UUID } from '../../../lib/utils/uuid';

export class TodoNotFoundError extends Error {

    constructor(
        public readonly todoId: UUID,
    ) {
        super(`Todo ${todoId} not found`);
    }
}
