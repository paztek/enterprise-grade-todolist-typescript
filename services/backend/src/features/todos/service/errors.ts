/* tslint:disable:max-classes-per-file */
import { UUID } from '../../../lib/utils/uuid';
import { PersistedTodo } from '../model/todo';

export class TodoNotFoundError extends Error {

    constructor(
        public readonly todoId: UUID,
    ) {
        super(`Todo ${todoId} not found`);
    }
}

export class TodoInvalidError extends Error {

    constructor(
        message: string,
        public readonly errors: IValidationErrorItem[],
    ) {
        super(message);
    }
}

export class CommentInvalidError extends Error {

    constructor(
        public readonly todo: PersistedTodo,
        message: string,
        public readonly errors: IValidationErrorItem[],
    ) {
        super(message);
    }
}

interface IValidationErrorItem {

    /** An error message */
    message: string;

    /** The type of the validation error */
    type: string;

    /** The field that triggered the validation error */
    path: string;

    /** The value that generated the error */
    value: string;
}
