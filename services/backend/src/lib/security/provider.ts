import { Request } from 'express';
import { v4 as uuid } from 'uuid';

import { HTTPUnauthorizedError } from '../http/errors';
import { User } from './user';

export interface IAuthenticationProvider {
    authenticate(req: Request): Promise<User>;
}

export default class AuthenticationProvider implements IAuthenticationProvider {

    constructor() {
        // TODO Build keycloak with config
    }

    public async authenticate(req: Request): Promise<User> {
        const header = req.header('authorization');

        if (!header) {
            throw new HTTPUnauthorizedError();
        }

        if (!header.startsWith('Bearer ')) {
            throw new HTTPUnauthorizedError();
        }

        const token = header.slice(7);

        // TODO Verify token
        if (token.length === 0) {
            throw new HTTPUnauthorizedError();
        }

        return {
            id: uuid(),
            username: 'matthieu',
        };
    }
}
