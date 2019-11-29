/* tslint:disable:max-classes-per-file */
import {
    DataTypes,
    Model,
    ModelAttributes,
    ModelOptions,
    Sequelize,
    ValidationError,
} from 'sequelize';
import { inject, injectable } from 'tsyringe';

import { InvalidResourceError } from '../../../lib/provider/errors';
import { UUID } from '../../../lib/utils/uuid';
import { ILogger } from '../../../logger';
import { Tag } from '../../tags/model';
import TagProvider from '../../tags/provider';
import { PersistedTodo, Todo } from '../model';

const modelMapping: ModelAttributes = {
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

const modelOptions: ModelOptions = {
    modelName: 'Todo',
    tableName: 'todos',
    underscored: true,
};

class TodoModel extends Model {
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
        @inject(TagProvider) private readonly tagProvider: TagProvider,
    ) {
        logger.info('Initializing Sequelize model Todo');

        TodoModel.init(
            modelMapping,
            {
                ...modelOptions,
                sequelize,
            });
    }

    public async findOne(id: UUID): Promise<PersistedTodo | null> {
        const instance = await TodoModel.findByPk(id);

        if (!instance) {
            return null;
        }

        const tags = await this.tagProvider.getTags(instance.id);

        return this.convertInstanceToBusinessObject(instance, tags);
    }

    public async findAll(): Promise<PersistedTodo[]> {
        const instances = await TodoModel.findAll();

        return Promise.all(instances.map(async (instance) => {
            const tags = await this.tagProvider.getTags(instance.id);
            return this.convertInstanceToBusinessObject(instance, tags);
        }));
    }

    public async destroyAll(): Promise<number> {
        const instances = await TodoModel.findAll();

        await Promise.all(instances.map(async (instance) => {
            await this.tagProvider.removeTags(instance.id);
            return instance.destroy();
        }));

        return instances.length;
    }

    public async create(todo: Todo): Promise<PersistedTodo> {
        const attributes = {
            label: todo.label,
            done: todo.done,
        };

        try {
            // Create instance
            const instance = await TodoModel.create(attributes);

            // Set tags
            const tags = await this.tagProvider.setTags(instance.id, todo.tags);

            return this.convertInstanceToBusinessObject(instance, tags);
        } catch (err) {
            if (err instanceof ValidationError) {
                err = new InvalidResourceError(err.message, err.errors);
            }

            throw err;
        }
    }

    public async update(todo: PersistedTodo): Promise<PersistedTodo> {
        const instance = await TodoModel.findByPk(todo.id, {
            rejectOnEmpty: true,
        });

        const attributes = {
            label: todo.label,
            done: todo.done,
        };

        try {
            // Update instance
            instance.set(attributes);
            await instance.save();

            // Set tags
            const tags = await this.tagProvider.setTags(instance.id, todo.tags);

            return this.convertInstanceToBusinessObject(instance, tags);
        } catch (err) {
            if (err instanceof ValidationError) {
                err = new InvalidResourceError(err.message, err.errors);
            }

            throw err;
        }
    }

    public async delete(todo: PersistedTodo): Promise<void> {
        const instance = await TodoModel.findByPk(todo.id, {
            rejectOnEmpty: true,
        });

        await this.tagProvider.removeTags(instance.id);

        return instance.destroy();
    }

    protected convertInstanceToBusinessObject(instance: TodoModel, tags: Tag[]): PersistedTodo {
        return {
            id: instance.id,
            label: instance.label,
            done: instance.done,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
            tags,
        };
    }
}
