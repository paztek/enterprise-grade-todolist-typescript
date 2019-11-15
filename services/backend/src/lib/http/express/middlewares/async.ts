import { NextFunction, Request, Response } from 'express';

/**
 * Allows wrapping a Express request handler or middleware so it can return a Promise
 */
export default function asyncMiddleware(fn: (req: Request, res: Response, next: NextFunction) => any) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((err) => {
                next(err);
            });
    };
};
