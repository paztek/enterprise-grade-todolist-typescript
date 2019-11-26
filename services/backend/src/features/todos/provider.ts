/* tslint:disable:max-classes-per-file */
import * as _ from 'lodash';
import { DataTypes, Model, ModelAttributes, ModelOptions, Sequelize } from 'sequelize';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../lib/utils/uuid';
import { ILogger } from '../../logger';
import { ITodo } from './model';

const mapping: ModelAttributes = {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
};

const options: ModelOptions = {
    modelName: 'Todo',
    tableName: 'todos',
    underscored: true,
};

export class TodoModel extends Model {
    public readonly id: UUID;
    public readonly label: string;
    public readonly done: boolean;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
}

@injectable()
export default class TodoProvider {

    constructor(
        @inject('logger') logger: ILogger,
        @inject('sequelize') sequelize: Sequelize,
    ) {
        logger.info('Initializing Sequelize mode Todo');
        TodoModel.init(mapping, { ...options, sequelize });
    }

    public async findOne(id: UUID): Promise<ITodo | null> {
        const instance = await TodoModel.findByPk(id);

        return instance ? this.convertInstanceToBusinessObject(instance) : null;
    }

    public async findAll(): Promise<ITodo[]> {
        const instances = await TodoModel.findAll();

        return instances.map(this.convertInstanceToBusinessObject);
    }

    public destroyAll(): Promise<number> {
        return TodoModel.destroy({ where: {} });
    }

    public async create(todo: ITodo): Promise<ITodo> {
        const attributes = this.convertBusinessObjectToAttributes(todo);
        const instance = await TodoModel.create(attributes);

        return this.convertInstanceToBusinessObject(instance);
    }

    public async update(todo: ITodo, label?: string, done?: boolean): Promise<ITodo> {
        const instance = await TodoModel.findByPk(todo.id, { rejectOnEmpty: true });

        const attributes = _.omitBy({ label, done },  _.isUndefined);
        instance.set(attributes);
        await instance.save();

        return this.convertInstanceToBusinessObject(instance);
    }

    public async delete(todo: ITodo): Promise<void> {
        const instance = await TodoModel.findByPk(todo.id, { rejectOnEmpty: true });

        return instance.destroy();
    }

    protected convertInstanceToBusinessObject(instance: TodoModel): ITodo {
        return {
            id: instance.id,
            label: instance.label,
            done: instance.done,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
        };
    }

    protected convertBusinessObjectToAttributes(todo: ITodo): any { // TODO Better typings
        return {
            label: todo.label,
            done: todo.done,
        };
    }
}
