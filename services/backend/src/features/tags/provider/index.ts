/* tslint:disable:max-classes-per-file */
import {
    DataTypes,
    Model,
    ModelAttributes,
    ModelOptions,
    Op,
    Sequelize
} from 'sequelize';
import { inject, injectable } from 'tsyringe';

import { UUID } from '../../../lib/utils/uuid';
import { ILogger } from '../../../logger';
import { Tag } from '../model/tag';

const modelAttributes: ModelAttributes = {
    taggableId: {
        primaryKey: true,
        type: DataTypes.UUID,
        field: 'taggable_id',
    },
    tag: {
        primaryKey: true,
        type: DataTypes.STRING,
        field: 'tag',
    },
};

const modelOptions: ModelOptions = {
    modelName: 'ResourceTagAssociation',
    tableName: 'resource_tag_associations',
    underscored: true,
};

class ResourceTagAssociationModel extends Model {
    public readonly taggableId: UUID;
    public readonly tag: Tag;
}

@injectable()
export default class TagProvider {

    constructor(
        @inject('logger') logger: ILogger,
        @inject('sequelize') sequelize: Sequelize,
    ) {
        logger.info('Initializing Sequelize model Tag');

        ResourceTagAssociationModel.init(
            modelAttributes,
            {
                ...modelOptions,
                sequelize,
            });
    }

    public async getTags(taggableId: UUID): Promise<Tag[]> {
        const instances = await ResourceTagAssociationModel.findAll({
            where: {
                taggableId,
            },
        });

        return instances.map((instance) => this.convertInstanceToBusinessObject(instance));
    }

    public async setTags(taggableId: UUID, tags: Tag[]): Promise<Tag[]> {
        // Remove associations that no longer exist
        await ResourceTagAssociationModel.destroy({
            where: {
                taggableId,
                tag: {
                    [Op.notIn]: tags,
                },
            },
        });

        // Add the new associations
        await Promise.all(tags.map((tag) =>
            ResourceTagAssociationModel.findOrCreate({
                where: {
                    taggableId,
                    tag,
                },
                defaults: {
                    taggableId,
                    tag,
                },
            })));

        return tags;
    }

    public async removeTags(taggableId: UUID): Promise<number> {
        return ResourceTagAssociationModel.destroy({
            where: {
                taggableId,
            },
        });
    }

    protected convertInstanceToBusinessObject(instance: ResourceTagAssociationModel): Tag {
        return instance.tag;
    }
}
