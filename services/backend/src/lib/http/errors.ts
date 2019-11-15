export class HTTPError extends Error {

    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message);
    }
}
