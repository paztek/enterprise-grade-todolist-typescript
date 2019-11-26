'use strict';

const TABLE_NAME = 'comments';

module.exports = {
    up: (queryInterface, Sequelize) =>
        queryInterface.createTable(
            TABLE_NAME,
            {
                id: {
                    primaryKey: true,
                    type: Sequelize.UUID,
                },
                text: {
                    type: Sequelize.STRING,
                    allowNull: false,
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
                todoId: {
                    type: Sequelize.UUID,
                    field: 'todo_id',
                    allowNull: false,
                    references: {
                        model: 'todos',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                }
            }
        ),

    down: (queryInterface, Sequelize) => queryInterface.dropTable(TABLE_NAME),
};
