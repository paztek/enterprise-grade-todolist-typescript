import { expect } from 'chai';
import { QueryTypes, Sequelize } from 'sequelize';
import * as Sinon from 'sinon';
import { container } from 'tsyringe';
import { v4 as uuid } from 'uuid';

import TodoProvider from '.';
import globalConfig from '../../../config';
import { UUID } from '../../../lib/utils/uuid';
import logger from '../../../logger';
import TagProvider from '../../tags/provider';
import { build as buildComment, Comment } from '../model/comment';
import { build as buildTodo, Todo } from '../model/todo';

const { db } = globalConfig;

describe('TodoProvider', () => {

    container.register('logger', {
        useValue: logger,
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

    const tagProvider = Sinon.createStubInstance(TagProvider);
    container.register(TagProvider, {
        useValue: tagProvider as any as TagProvider,
    });

    const provider = container.resolve(TodoProvider);

    before(() => sequelize.authenticate());

    after(() => sequelize.close());

    beforeEach(async () => {
        await sequelize.drop({ cascade: true });
        await sequelize.sync();
    });

    async function insertTodo(id: UUID, todo: Todo): Promise<any> {
        const now = +new Date();
        await sequelize.query(`INSERT INTO todos (id, label, done, created_at, updated_at) VALUES ('${id}', '${todo.label}', ${todo.done}, to_timestamp(${now}), to_timestamp(${now}))`);
    }

    async function insertComment(todoId: UUID, id: UUID, comment: Comment): Promise<any> {
        const now = +new Date();
        await sequelize.query(`INSERT INTO comments (id, text, created_at, updated_at, todo_id) VALUES ('${id}', '${comment.text}', to_timestamp(${now}), to_timestamp(${now}), '${todoId}')`);
    }

    describe('findTodo', () => {

        it('should retrieve a todo with its tags and comments', async () => {
            const todo = buildTodo({ tags: ['foo', 'bar'] });
            const todoId = uuid();
            await insertTodo(todoId, todo);
            const comment = buildComment();
            const commentId = uuid();
            await insertComment(todoId, commentId, comment);
            tagProvider.getTags.resolves(todo.tags);

            const todoFound = await provider.findTodo(todoId);

            expect(todoFound).to.not.be.null;
            expect(todoFound!.id).to.eq(todoId);
            expect(todoFound!.comments).to.have.lengthOf(1);
            expect(todoFound!.tags).to.have.lengthOf(2);
        });

        it('should return null if todo not found', async () => {
            const id = uuid();

            const todoFound = await provider.findTodo(id);

            expect(todoFound).to.be.null;
        });
    });

    describe('findTodos', () => {

        it('should retrieve a list of todos with their tags', async () => {
            const todos: Todo[] = [
                buildTodo({ label: 'Todo 1', tags: ['foo', 'bar'] }),
                buildTodo({ label: 'Todo 2', tags: ['baz'] }),
            ];
            const todoIds = [
                uuid(),
                uuid(),
            ];
            await Promise.all(todos.map(async (todo, index) => {
                const todoId = todoIds[index];
                await insertTodo(todoId, todo);
                const comment = buildComment();
                const commentId = uuid();
                await insertComment(todoId, commentId, comment);
            }));
            tagProvider.getTags.callsFake((id) => {
                const index = todoIds.indexOf(id);
                return Promise.resolve(todos[index].tags);
            });

            const todosFound = await provider.findTodos();

            expect(todosFound).to.have.lengthOf(todos.length);
            expect(todosFound[0].comments).to.have.lengthOf(1);
            expect(todosFound[0].tags.sort()).to.eql(todos[0].tags.sort());
            expect(todosFound[1].comments).to.have.lengthOf(1);
            expect(todosFound[1].tags.sort()).to.eql(todos[1].tags.sort());
        });
    });

    describe('createTodo', () => {

        it('should create and return a todo', async () => {
            const todo = buildTodo({ label: 'My todo', tags: ['foo', 'bar'] });
            tagProvider.setTags.resolves(todo.tags);

            const todoCreated = await provider.createTodo(todo);

            expect(todoCreated.id).to.not.be.undefined;
            expect(todoCreated.comments).to.have.lengthOf(0);
            expect(todoCreated.tags).to.have.lengthOf(todo.tags.length);

            const rowsTodos = await sequelize.query('SELECT * FROM todos', { type: QueryTypes.SELECT });
            expect(rowsTodos).to.have.lengthOf(1);
        });
    });

    describe('updateTodo', () => {

        it('should update and return an existing todo', async () => {
            const todo = buildTodo({ tags: ['foo', 'bar'] });
            const todoId = uuid();
            await insertTodo(todoId, todo);
            const comment = buildComment();
            const commentId = uuid();
            await insertComment(todoId, commentId, comment);

            const todoToUpdate = {
                ...todo,
                id: todoId,
                label: 'My updated todo',
                tags: ['baz'],
            };
            tagProvider.setTags.resolves(todoToUpdate.tags);

            const todoUpdated = await provider.updateTodo(todoToUpdate);

            expect(todoUpdated.label).to.eq(todoToUpdate.label);
            expect(todoUpdated.comments).to.have.lengthOf(1);
            expect(todoUpdated.tags.sort()).to.eql(todoToUpdate.tags.sort());
        });
    });

    describe('deleteTodo', () => {

        it('should delete an existing todo', async () => {
            const todo = buildTodo({ label: 'My todo', tags: ['foo', 'bar'] });
            const todoId = uuid();
            await insertTodo(todoId, todo);

            const todoToDelete = {
                ...todo,
                id: todoId,
            };

            await provider.deleteTodo(todoToDelete);

            const rowsTodos = await sequelize.query('SELECT * FROM todos', { type: QueryTypes.SELECT });
            expect(rowsTodos).to.have.lengthOf(0);
        });
    });

    describe('createTodoComment', () => {

        const todo = buildTodo({ label: 'My todo', tags: ['foo', 'bar'] });
        const todoId = uuid();

        beforeEach(async () => {
            await insertTodo(todoId, todo);
        });

        it('should add a comment to an existing todo', async () => {
            const existingTodo = {
                ...todo,
                id: todoId,
            };
            const comment = buildComment();

            const commentCreated = await provider.createTodoComment(existingTodo, comment);

            expect(commentCreated.id).to.not.be.undefined;
            expect(commentCreated.text).to.eq(comment.text);
        });
    });
});
