import { expect } from 'chai';
import { QueryTypes, Sequelize } from 'sequelize';
import * as Sinon from 'sinon';
import { container } from 'tsyringe';
import uuid from 'uuid';

import TodoProvider from '.';
import globalConfig from '../../../config';
import { UUID } from '../../../lib/utils/uuid';
import logger from '../../../logger';
import TagProvider from '../../tags/provider';
import build from '../factory';
import { Todo } from '../model';

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

    describe('findOne', () => {

        it('should retrieve a todo with its tags', async () => {
            const todo: Todo = build({ tags: ['foo', 'bar'] });
            const id = uuid();
            await insertTodo(id, todo);
            tagProvider.getTags.resolves(todo.tags);

            const todoFound = await provider.findOne(id);

            expect(todoFound).to.not.be.null;
            expect(todoFound!.id).to.eq(id);
            expect(todoFound!.tags.length).to.eq(2);
        });

        it('should return null if todo not found', async () => {
            const id = uuid();

            const todoFound = await provider.findOne(id);

            expect(todoFound).to.be.null;
        });
    });

    describe('findAll', () => {

        it('should retrieve a list of todos with their tags', async () => {
            const todos: Todo[] = [
                build({ label: 'Todo 1', tags: ['foo', 'bar'] }),
                build({ label: 'Todo 2', tags: ['baz'] }),
            ];
            const ids = [
                uuid(),
                uuid(),
            ];
            await Promise.all(todos.map((todo, index) => insertTodo(ids[index], todo)));
            tagProvider.getTags.callsFake((id) => {
                const index = ids.indexOf(id);
                return Promise.resolve(todos[index].tags);
            });

            const todosFound = await provider.findAll();

            expect(todosFound).to.have.lengthOf(todos.length);
            expect(todosFound[0].tags.sort()).to.eql(todos[0].tags.sort());
            expect(todosFound[1].tags.sort()).to.eql(todos[1].tags.sort());
        });
    });

    describe('destroyAll', () => {

        it('should remove all the todos', async () => {
            const todos: Todo[] = [
                build({ label: 'Todo 1', tags: ['foo', 'bar'] }),
                build({ label: 'Todo 2', tags: ['baz'] }),
            ];
            await Promise.all(todos.map((todo) => insertTodo(uuid(), todo)));

            const deletedCount = await provider.destroyAll();

            expect(deletedCount).to.eq(todos.length);
        });
    });

    describe('create', () => {

        it('should create and return a todo', async () => {
            const todo = build({ label: 'My todo', tags: ['foo', 'bar'] });
            tagProvider.setTags.resolves(todo.tags);

            const todoCreated = await provider.create(todo);

            expect(todoCreated.id).to.not.be.undefined;
            expect(todoCreated.tags).to.have.lengthOf(todo.tags.length);

            const rowsTodos = await sequelize.query('SELECT * FROM todos', { type: QueryTypes.SELECT });
            expect(rowsTodos).to.have.lengthOf(1);
        });
    });

    describe('update', () => {

        it('should update and return an existing todo', async () => {
            const todo = build({ label: 'My todo', tags: ['foo', 'bar'] });
            const id = uuid();
            await insertTodo(id, todo);

            const todoToUpdate = {
                ...todo,
                id,
                label: 'My updated todo',
                tags: ['baz'],
            };
            tagProvider.setTags.resolves(todoToUpdate.tags);

            const todoUpdated = await provider.update(todoToUpdate);

            expect(todoUpdated.label).to.eq(todoToUpdate.label);
            expect(todoUpdated.tags.sort()).to.eql(todoToUpdate.tags.sort());
        });
    });
});
