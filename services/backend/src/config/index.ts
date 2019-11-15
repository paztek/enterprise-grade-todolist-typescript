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
};

export default config;
