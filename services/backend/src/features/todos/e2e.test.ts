import { expect } from 'chai';
import express, { Express } from 'express';
import { Sequelize } from 'sequelize';
import request from 'supertest';
import { container } from 'tsyringe';

import globalConfig from '../../config';
import DBService from '../../db';
import HTTPService from '../../http/service';
import { FeaturesConfig } from '../../lib/feature';
import logger from '../../logger';
import Server from '../../server';
import TodosFeature from './';

const { http, db } = globalConfig;

describe('Todos E2E', () => {

    let server: Server;
    let app: Express;

    before('bootstrap server', async () => {
        container.register('logger', {
            useValue: logger,
        });

        // Dependencies
        app = express();
        app.set('port', http.port);
        container.register('express', {
            useValue: app,
        });

        const sequelize = new Sequelize(db.uri, {
            define: {
                underscored: true,
            },
            logging: function log(message) { logger.debug(message); },
        });
        container.register('sequelize', {
            useValue: sequelize,
        });

        container.register('http', {
            useClass: HTTPService,
        });
        container.register('db', {
            useClass: DBService,
        });

        // Features
        const featuresConfig: FeaturesConfig = [
            { feature: TodosFeature },
        ];

        server = container.resolve(Server);
        server.resolveFeatures(featuresConfig);
        await server.start();
    });

    after('close server', async () => {
        await server.stop();
        container.reset();
    });

    describe('GET /todos', () => {

        it('should return a HTTP 200', async () => {
            const response = await request(app).get('/todos');

            expect(response.status).to.eq(200);
        });
    });

    describe('GET /todos/:todoId', () => {

        it('should return a HTTP 200', async () => {
            const response = await request(app).get('/todos/1234');

            expect(response.status).to.eq(200);
        });
    });
});
