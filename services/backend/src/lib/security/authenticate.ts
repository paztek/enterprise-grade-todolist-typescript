import { NextFunction, Response } from 'express';

import { IAuthenticationProvider } from './provider';
import { AuthenticatedRequest } from './request';

export default function (provider: IAuthenticationProvider) {

    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
        req.user = await provider.authenticate(req);
        return next();
    };
}
