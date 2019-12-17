/* tslint:disable:max-classes-per-file */
import * as _ from 'lodash';
import VError from 'verror';

import { UUID } from '../utils/uuid';

export class ResourceNotFoundError extends VError {

    constructor(id: UUID) {
        const message = `Resource with ID ${id} not found`;
        super(message);
    }
}

export class InvalidResourceError extends VError {}

/*
export class InvalidResourceError extends VError {

    public readonly errors: IValidationErrorItem[];

    constructor(
        message: string,
        errors: IValidationErrorItem[],
    ) {
        super(message);

        // Rebuild the errors to make sure only the message, type, path & value keys are present
        this.errors = errors.map((error) => _.pick(error, ['message', 'type', 'path', 'value']));
    }
}
 */

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
