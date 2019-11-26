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
import buildTodo from '../factory';
import { ITodo } from '../model';
import TodoProvider from '../provider';
import CommentsFeature from './';
import build from './factory';
import CommentProvider from './provider';

const { http, db } = globalConfig;

describe('Comments E2E', () => {

    let server: Server;
    let app: Express;

    let todo1: ITodo;
    let todo2: ITodo;

    let todoProvider: TodoProvider;
    let commentProvider: CommentProvider;

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

        todoProvider = container.resolve(TodoProvider);
        commentProvider = container.resolve(CommentProvider);
    });

    after('close server', async () => {
        await server.stop();
        container.reset();
    });

    beforeEach('remove the todos from the DB', async () => {
        await todoProvider.destroyAll(); // This should cascade delete also the comments
    });

    beforeEach('insert some todos', async () => {
        todo1 = buildTodo({ label: 'Todo 1'});
        todo1 = await todoProvider.create(todo1);
        todo2 = buildTodo({ label: 'Todo 2'});
        todo2 = await todoProvider.create(todo2);
    });

    describe('GET /todos/:id/comments', () => {

        it('should return a HTTP 200 with the comments', async () => {const comment11 = build({ text: 'Comment 11' });
            await commentProvider.create(todo1, comment11);
            const comment12 = build({ text: 'Comment 12' });
            await commentProvider.create(todo1, comment12);

            const comment21 = build({ text: 'Comment 21' });
            await commentProvider.create(todo2, comment21);

            const response = await request(app)
                .get(`/todos/${todo1.id}/comments`);

            expect(response.status).to.eq(200);
            expect(response.body).to.have.lengthOf(2);
        });
    });

    // TODO CRUD endpoints
});
