import { Test } from 'supertest';

import { Token } from '../../src/lib/security/token';

export default function authenticateFactory(token: Token): (req: Test) => Test {
    return (req: Test): Test => {
        return req.set('Authorization', `Bearer ${token}`);
    };
}
