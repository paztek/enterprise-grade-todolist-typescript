import { NextFunction, Request, Response } from 'express';
import { HTTPError, HTTPInternalServerError } from '../../errors';

/**
 * Allows wrapping a Express request handler or middleware so it can return a Promise
 */
export default function asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => any) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((err) => {
                if (!(err instanceof HTTPError)) {
                    err = new HTTPInternalServerError(err);
                }

                next(err);
            });
    };
};
