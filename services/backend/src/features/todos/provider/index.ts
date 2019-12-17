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
import { PersistedTodo, Todo } from '../model/todo';
import { Comment, PersistedComment } from '../model/comment';

const todoModelMapping: ModelAttributes = {
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

const todoModelOptions: ModelOptions = {
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
    public readonly comments: CommentModel[];
}

const commentModelMapping: ModelAttributes = {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
};

const commentModelOptions: ModelOptions = {
    modelName: 'Comment',
    tableName: 'comments',
    underscored: true,
};

export class CommentModel extends Model {
    public readonly id: UUID;
    public readonly text: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly todoId: TodoModel['id'];
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
            todoModelMapping,
            {
                ...todoModelOptions,
                sequelize,
                defaultScope: {
                    include: [{ model: CommentModel, as: 'comments' }],
                },
            });

        CommentModel.init(
            commentModelMapping,
            {
                ...commentModelOptions,
                sequelize,
            });

        TodoModel.hasMany(
            CommentModel,
            {
                as: 'comments',
                foreignKey: {
                    name: 'todoId',
                    field: 'todo_id'
                },
                onDelete: 'CASCADE',
            });
    }

    public async findTodo(id: UUID): Promise<PersistedTodo | null> {
        const instance = await TodoModel.findByPk(id);

        if (!instance) {
            return null;
        }

        const tags = await this.tagProvider.getTags(instance.id);

        return this.convertTodoInstanceToTodo(instance, tags);
    }

    public async findTodos(): Promise<PersistedTodo[]> {
        const instances = await TodoModel.findAll();

        return Promise.all(instances.map(async (instance) => {
            const tags = await this.tagProvider.getTags(instance.id);
            return this.convertTodoInstanceToTodo(instance, tags);
        }));
    }

    public async createTodo(todo: Todo): Promise<PersistedTodo> {
        const attributes = this.convertTodoToAttributes(todo);

        try {
            // Create instance
            const instance = await TodoModel.create(attributes);

            // Set tags
            const tags = await this.tagProvider.setTags(instance.id, todo.tags);

            return this.convertTodoInstanceToTodo(instance, tags);
        } catch (err) {
            if (err instanceof ValidationError) {
                err = new InvalidResourceError(err.message, err.errors);
            }

            throw err;
        }
    }

    public async updateTodo(todo: PersistedTodo): Promise<PersistedTodo> {
        const instance = await TodoModel.findByPk(todo.id, {
            rejectOnEmpty: true,
        });

        const attributes = this.convertTodoToAttributes(todo);

        try {
            // Update instance
            instance.set(attributes);
            await instance.save();

            // Set tags
            const tags = await this.tagProvider.setTags(instance.id, todo.tags);

            return this.convertTodoInstanceToTodo(instance, tags);
        } catch (err) {
            if (err instanceof ValidationError) {
                err = new InvalidResourceError(err.message, err.errors);
            }

            throw err;
        }
    }

    public async deleteTodo(todo: PersistedTodo): Promise<void> {
        const instance = await TodoModel.findByPk(todo.id, {
            rejectOnEmpty: true,
        });

        await this.tagProvider.removeTags(instance.id);

        return instance.destroy();
    }

    public async createTodoComment(todo: PersistedTodo, comment: Comment): Promise<PersistedComment> {
        const attributes = this.convertCommentToAttributes(todo, comment);

        try {
            const instance = await CommentModel.create(attributes);

            return this.convertCommentInstanceToComment(instance);
        } catch (err) {
            if (err instanceof ValidationError) {
                err = new InvalidResourceError(err.message, err.errors);
            }

            throw err;
        }
    }

    protected convertTodoToAttributes(todo: Todo) { // TODO Typings
        return {
            label: todo.label,
            done: todo.done,
        };
    }

    protected convertTodoInstanceToTodo(instance: TodoModel, tags: Tag[]): PersistedTodo {
        return {
            id: instance.id,
            label: instance.label,
            done: instance.done,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
            tags,
            comments: (instance.comments || []).map((commentInstance) =>
                this.convertCommentInstanceToComment(commentInstance)),
        };
    }

    protected convertCommentToAttributes(todo: Todo, comment: Comment) { // TODO Typings
        return {
            todoId: todo.id,
            text: comment.text,
        };
    }

    protected convertCommentInstanceToComment(instance: CommentModel): PersistedComment {
        return {
            id: instance.id,
            text: instance.text,
        };
    }
}
