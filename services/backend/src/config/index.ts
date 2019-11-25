import { IConfig } from './config';

const ENV = process.env;

const config: IConfig = {
    environment: ENV.NODE_ENV || 'development',

    logging: {
        level: ENV.LOGGING_LEVEL || 'debug',
    },

    http: {
        port: ENV.PORT ? parseInt(ENV.PORT, 10) : 3000,
    },

    db: {
        uri: ENV.DATABASE_URI || 'postgres://localhost:5432/todos_dev',
    },
};

export default config;
