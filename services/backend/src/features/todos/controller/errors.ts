/* tslint:disable:max-classes-per-file */
import { HTTPBadRequestError, HTTPNotFoundError } from '../../../lib/http/errors';
import { UUID } from '../../../lib/utils/uuid';

export class TodoHTTPNotFoundError extends HTTPNotFoundError {
    constructor(todoId: UUID) {
        super(`Todo ${todoId} not found`);
    }
}

export class TodoHTTPBadRequestError extends HTTPBadRequestError {
}
