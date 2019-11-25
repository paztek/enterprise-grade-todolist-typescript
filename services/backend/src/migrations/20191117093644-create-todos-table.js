'use strict';

const TABLE_NAME = 'todos';

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            TABLE_NAME,
            {
                id: {
                    primaryKey: true,
                    type: Sequelize.UUID,
                },
                label: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                done: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
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

    down: (queryInterface, Sequelize) => queryInterface.dropTable(TABLE_NAME),
};
