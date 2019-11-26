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
import build from './factory';
import TodoProvider from './provider';

const { http, db } = globalConfig;

describe('Todos E2E', () => {

    let server: Server;
    let app: Express;

    let todoProvider: TodoProvider;

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

        todoProvider = container.resolve(TodoProvider);
    });

    after('close server', async () => {
        await server.stop();
        container.reset();
    });

    beforeEach('remove the todos from the DB', async () => {
        await todoProvider.destroyAll();
    });

    describe('GET /todos', () => {

        it('should return a HTTP 200 with the todos', async () => {
            const todo1 = build({ label: 'Todo 1'});
            await todoProvider.create(todo1);
            const todo2 = build({ label: 'Todo 2'});
            await todoProvider.create(todo2);

            const response = await request(app)
                .get('/todos');

            expect(response.status).to.eq(200);
            expect(response.body).to.have.lengthOf(2);
        });
    });

    describe('POST /todos', () => {

        it('should throw a HTTP 400 in case of invalid data', async () => {
            const data = {
                label: null,
            };

            const response = await request(app)
                .post('/todos')
                .send(data);

            expect(response.status).to.eq(400);
            expect(response.body.message).to.not.be.undefined;
        });

        it('should return a HTTP 201 with the created todo', async () => {
            const data = {
                label: 'Todo',
            };

            const response = await request(app)
                .post('/todos')
                .send(data);

            expect(response.status).to.eq(201);
            expect(response.body.id).to.not.be.undefined;
            expect(response.body.label).to.eq(data.label);
        });
    });

    describe('GET /todos/:todoId', () => {

        it('should return a HTTP 200 with the todo', async () => {
            let todo = build();
            todo = await todoProvider.create(todo);

            const response = await request(app)
                .get(`/todos/${todo.id}`);

            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(todo.id);
        });
    });

    describe('PUT /todos/:todoId', () => {

        it('should return a HTTP 200 with the updated todo', async () => {
            let todo = build();
            todo = await todoProvider.create(todo);

            const response = await request(app)
                .put(`/todos/${todo.id}`)
                .send({ done: true });

            expect(response.status).to.eq(200);
            expect(response.body.done).to.eq(true);
        });
    });

    describe('DELETE /todos/:todoId', () => {

        it('should return a HTTP 204', async () => {
            let todo = build();
            todo = await todoProvider.create(todo);

            const response = await request(app)
                .del(`/todos/${todo.id}`);

            expect(response.status).to.eq(204);
            expect(response.body).to.be.empty;
        });
    });
});
