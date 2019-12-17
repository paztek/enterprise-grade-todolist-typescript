import { expect } from 'chai';
import express, { Express, NextFunction, Request, Response } from 'express';
import sinon from 'sinon';
import { agent, SuperTest, Test } from 'supertest';

import asyncMiddleware from './async';
import { HTTPInternalServerError } from '../../errors';

describe('Async middleware wrapper', () => {

    let client: SuperTest<Test>;
    let app: Express;

    beforeEach(() => {
        app = express();
        client = agent(app);
    });

    it('should call next() with the error if the promise is rejected', async () => {
        const error = new HTTPInternalServerError();
        const handler = function handle(req: Request, res: Response, next: NextFunction) {
            return Promise.reject(error);
        };
        app.get('/foo', asyncMiddleware(handler));

        const errorSpy = sinon.spy();
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            errorSpy(err);
            next();
        });

        await client.get('/foo');

        expect(errorSpy).to.have.been.calledOnce;
        expect(errorSpy.getCalls()[0].args[0]).to.eq(error);
    });

    it('should return the response if the promise is resolved', async () => {
        const body = 'bar';
        const handler = function handle(req: Request, res: Response, next: NextFunction) {
            return new Promise((resolve) => {
                res.send(body);
                resolve();
            });
        };
        app.get('/foo', asyncMiddleware(handler));

        const response = await client.get('/foo');

        expect(response.text).to.eq(body);
    });

    it('should move to the next middleware / handler if next() is called without an error', async () => {
        const handler = function handle(req: Request, res: Response, next: NextFunction) {
            return new Promise((resolve) => {
                next();
                resolve();
            });
        };
        app.get('/foo', asyncMiddleware(handler));

        const handler2Spy = sinon.spy();
        const handler2 = function handle(req: Request, res: Response, next: NextFunction) {
            handler2Spy();
            res.send();
        };
        app.get('/foo', asyncMiddleware(handler2));

        await client.get('/foo');

        expect(handler2Spy).to.have.been.calledOnce;
    });
});
