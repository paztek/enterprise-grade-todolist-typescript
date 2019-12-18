import { expect } from 'chai';
import { QueryTypes, Sequelize } from 'sequelize';
import { container } from 'tsyringe';
import { v4 as uuid } from 'uuid';

import TagProvider from '.';
import globalConfig from '../../../config';
import { UUID } from '../../../lib/utils/uuid';
import logger from '../../../logger';
import { Tag } from '../model/tag';

const { db } = globalConfig;

describe('TagProvider', () => {

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

    const provider = container.resolve(TagProvider);

    before(() => sequelize.authenticate());

    after(() => sequelize.close());

    beforeEach(async () => {
        await sequelize.drop({ cascade: true });
        await sequelize.sync();
    });

    async function insertResourceTagAssociation(taggableId: UUID, tag: Tag): Promise<any> {
        const now = +new Date();
        await sequelize.query(`INSERT INTO resource_tag_associations (taggable_id, tag, created_at, updated_at) VALUES ('${taggableId}', '${tag}', to_timestamp(${now}), to_timestamp(${now}))`);
    }

    const id = uuid();
    const otherId = uuid();

    beforeEach( async () => {
        // Insert some preexisting tag associations
        await insertResourceTagAssociation(id, 'foo');
        await insertResourceTagAssociation(id, 'bar');
        await insertResourceTagAssociation(otherId, 'foo');
    });

    describe('setTags', () => {

        it('should associate a resource with some tags', async () => {
            const tags = ['baz', 'foo'];
            const tagsSet = await provider.setTags(id, tags);

            expect(tagsSet.sort()).to.eql(tags.sort());

            const rowsTagAssociations = await sequelize.query(`SELECT * FROM resource_tag_associations WHERE taggable_id = '${id}'`, { type: QueryTypes.SELECT });
            expect(rowsTagAssociations).to.have.lengthOf(tags.length);

            // Tags of other resource should be left untouched
            const otherRowsTagAssociations = await sequelize.query(`SELECT * FROM resource_tag_associations WHERE taggable_id = '${otherId}'`, { type: QueryTypes.SELECT });
            expect(otherRowsTagAssociations).to.have.lengthOf(1);
        });
    });

    describe('getTags', () => {

        it('should return the tags of the resource', async () => {
            const tagsFound = await provider.getTags(id);

            expect(tagsFound.sort()).to.eql(['foo', 'bar'].sort());
        });
    });

    describe('removeTags', () => {

        it('should remove the tags of the resource', async () => {
            const tagsRemovedCount = await provider.removeTags(id);

            expect(tagsRemovedCount).to.eq(2);

            // Tags of other resource should be left untouched
            const otherRowsTagAssociations = await sequelize.query(`SELECT * FROM resource_tag_associations WHERE taggable_id = '${otherId}'`, { type: QueryTypes.SELECT });
            expect(otherRowsTagAssociations).to.have.lengthOf(1);
        });
    });
});
