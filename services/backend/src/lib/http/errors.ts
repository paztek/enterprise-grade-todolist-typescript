/* tslint:disable:max-classes-per-file */
import VError from 'verror';

export enum HTTPStatus {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorize = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
}

export abstract class HTTPError extends VError {

    constructor(
        public readonly status: HTTPStatus,
        message: string,
        cause?: Error,
        public info?: any,
    ) {
        super({ cause, info }, message);
    }
}

export class HTTPInternalServerError extends HTTPError {

    constructor(cause?: Error, content?: any) {
        super(HTTPStatus.InternalServerError, 'Internal Server Error', cause, content);
    }
}

export class HTTPNotFoundError extends HTTPError {

    constructor(cause?: Error, content?: any) {
        super(HTTPStatus.NotFound, 'Not Found', cause, content);
    }
}

export class HTTPBadRequestError extends HTTPError {

    constructor(cause?: Error, content?: any) {
        super(HTTPStatus.BadRequest, 'Bad Request', cause, content);
    }
}
