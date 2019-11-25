/* tslint:disable:max-classes-per-file */

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

export class HTTPError extends Error {

    constructor(
        public readonly status: HTTPStatus,
        message: string
    ) {
        super(message);
    }
}

export class HTTPNotFoundError extends HTTPError {

    constructor(
        message: string
    ) {
        super(HTTPStatus.NotFound, message);
    }
}
