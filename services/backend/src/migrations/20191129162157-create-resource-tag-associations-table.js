'use strict';

const TABLE_NAME = 'resource_tag_associations';

module.exports = {

    up: async (queryInterface, Sequelize) =>
        queryInterface.createTable(
            TABLE_NAME,
            {
                taggableId: {
                    primaryKey: true,
                    type: Sequelize.UUID,
                    field: 'taggable_id',
                },
                tag: {
                    primaryKey: true,
                    type: Sequelize.STRING,
                    field: 'tag',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    field: 'created_at',
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    field: 'updated_at',
                },
            }
        ),

    down: async (queryInterface) => await queryInterface.dropTable(TABLE_NAME),
};
