module.exports = {
  [process.env.NODE_ENV]: {
    dialect: 'postgres',
    url: process.env.DATABASE_URI,
    migrationStorageTableName: 'sequelize_migrations',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
  },
};
