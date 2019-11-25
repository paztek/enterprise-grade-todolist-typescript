import { expect } from 'chai';
import express, { Express } from 'express';
import { Sequelize } from 'sequelize';
import request from 'supertest';
import { container } from 'tsyringe';

import TodosFeature from '../';
import globalConfig from '../../../config';
import DBService from '../../../db';
import HTTPService from '../../../http/service';
import { FeaturesConfig } from '../../../lib/feature';
import logger from '../../../logger';
import Server from '../../../server';
import CommentsFeature from './';
import TodoProvider from '../provider';
import { ITodo } from '../model';

const { http, db } = globalConfig;

describe('Comments E2E', () => {

    let server: Server;
    let app: Express;

    let todo1: ITodo;
    let todo2: ITodo;

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
            {
                feature: TodosFeature,
                children: [
                    CommentsFeature,
                ],
            },
        ];

        server = container.resolve(Server);
        server.resolveFeatures(featuresConfig);
        await server.start();
    });

    after('close server', async () => {
        await server.stop();
        container.reset();
    });

    before('insert some todos', async () => {
        const todoProvider = container.resolve(TodoProvider);

        todo1 = await todoProvider.create('Todo 1', false);
        todo2 = await todoProvider.create('Todo 2', false);
    });

    describe('GET /todos/:id/comments', () => {

        it('should return a HTTP 200', async () => {
            const response = await request(app).get(`/todos/${todo1.id}/comments`);

            expect(response.status).to.eq(200);
        });
    });
});
