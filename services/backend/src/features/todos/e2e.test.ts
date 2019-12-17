import { expect } from 'chai';
import express from 'express';
import { Sequelize } from 'sequelize';
import request from 'supertest';
import { container } from 'tsyringe';

import globalConfig from '../../config';
import DBService from '../../db';
import HTTPService from '../../http/service';
import { FeaturesConfig } from '../../lib/feature';
import logger from '../../logger';
import Server from '../../server';
import TagsFeature from '../tags';
import TodosFeature from './';
import { build as buildComment } from './model/comment';
import { build as buildTodo } from './model/todo';
import TodoProvider from './provider';

const { http, db } = globalConfig;

describe('Todos E2E', () => {

    container.register('logger', {
        useValue: logger,
    });

    // Dependencies
    const app = express();
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
        TodosFeature,
        TagsFeature,
    ];

    const server = container.resolve(Server);
    server.resolveFeatures(featuresConfig);

    const todoProvider = container.resolve(TodoProvider);

    before('start server', () => server.start());

    after('close server', () => server.stop());

    beforeEach('reset the DB', async () => {
        await sequelize.drop({ cascade: true });
        await sequelize.sync();
    });

    describe('GET /todos', () => {

        it('should return a HTTP 200 with the todos', async () => {
            const todo1 = buildTodo({ label: 'Todo 1' });
            await todoProvider.createTodo(todo1);
            const todo2 = buildTodo({ label: 'Todo 2' });
            await todoProvider.createTodo(todo2);

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
                tags: ['foo', 'bar'],
            };

            const response = await request(app)
                .post('/todos')
                .send(data);

            expect(response.status).to.eq(201);
            expect(response.body.id).to.not.be.undefined;
            expect(response.body.label).to.eq(data.label);
            expect(response.body.tags.sort()).to.eql(['foo', 'bar'].sort());
        });
    });

    describe('GET /todos/:todoId', () => {

        it('should return a HTTP 200 with the todo', async () => {
            const todo = buildTodo({ label: 'My todo', tags: ['foo', 'bar'] });
            const todoCreated = await todoProvider.createTodo(todo);
            const comment = buildComment();
            const commentCreated = await todoProvider.createTodoComment(todoCreated, comment);

            const response = await request(app)
                .get(`/todos/${todoCreated.id}`);

            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(todoCreated.id);
            expect(response.body.label).to.eq(todoCreated.label);
            expect(response.body.tags.sort()).to.eql(todoCreated.tags.sort());
            expect(response.body.comments).to.have.lengthOf(1);
            expect(response.body.comments[0].id).to.eq(commentCreated.id);

        });
    });

    describe('PUT /todos/:todoId', () => {

        it('should throw a HTTP 400 in case of invalid data', async () => {
            const todo = buildTodo();
            const todoCreated = await todoProvider.createTodo(todo);

            const data = {
                label: null,
            };

            const response = await request(app)
                .put(`/todos/${todoCreated.id}`)
                .send(data);

            expect(response.status).to.eq(400);
            expect(response.body.message).to.not.be.undefined;
        });

        it('should return a HTTP 200 with the updated todo', async () => {
            const todo = buildTodo({ label: 'My todo', tags: ['foo', 'bar'] });
            const todoCreated = await todoProvider.createTodo(todo);
            const comment = buildComment();
            const commentCreated = await todoProvider.createTodoComment(todoCreated, comment);

            const data = {
                done: true,
                tags: ['baz', 'foo'],
            };

            const response = await request(app)
                .put(`/todos/${todoCreated.id}`)
                .send(data);

            expect(response.status).to.eq(200);
            expect(response.body.done).to.eq(true);
            expect(response.body.label).to.eq(todoCreated.label);
            expect(response.body.tags.sort()).to.eql(data.tags.sort());
            expect(response.body.comments).to.have.lengthOf(1);
            expect(response.body.comments[0].id).to.eq(commentCreated.id);
        });
    });

    describe('DELETE /todos/:todoId', () => {

        it('should return a HTTP 204', async () => {
            const todo = buildTodo();
            const todoCreated = await todoProvider.createTodo(todo);

            const response = await request(app)
                .del(`/todos/${todoCreated.id}`);

            expect(response.status).to.eq(204);
            expect(response.body).to.be.empty;
        });
    });

    describe('POST /todos/:todoId/comments', () => {

        it('should create a comment', async () => {
            const todo = buildTodo();
            const todoCreated = await todoProvider.createTodo(todo);

            const data = {
                text: 'My comment',
            };

            const response = await request(app)
                .post(`/todos/${todoCreated.id}/comments`)
                .send(data);

            expect(response.status).to.eq(201);
            expect(response.body.id).to.not.be.undefined;
            expect(response.body.text).to.eq(data.text);
        });
    });
});
