/* tslint:disable:max-classes-per-file */
import { DataTypes, Model, ModelAttributes, ModelOptions, Sequelize } from 'sequelize';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../../lib/utils/uuid';
import { ILogger } from '../../../logger';
import { ITodo } from '../model';
import { TodoModel } from '../provider';
import { IComment } from './comment';

const mapping: ModelAttributes = {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
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
export default class CommentProvider {

    constructor(
        @inject('logger') logger: ILogger,
        @inject('sequelize') sequelize: Sequelize,
    ) {
        logger.info('Initializing Sequelize mode Comment');

        CommentModel.init(mapping, { ...options, sequelize });
        CommentModel.belongsTo(TodoModel, { targetKey: 'id' });
    }

    public async findAll(todo: ITodo): Promise<IComment[]> {
        const instances = await CommentModel.findAll({
            where: {
                todoId: todo.id,
            },
        });

        return instances.map(this.convertInstanceToBusinessObject);
    }

    protected convertInstanceToBusinessObject(instance: CommentModel): IComment {
        return {
            id: instance.id,
            text: instance.text,
            createdAt: instance.createdAt,
        };
    }
}
