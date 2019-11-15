import winston from 'winston';

import globalConfig from '../config';

export type ILogger = winston.Logger;

const { environment, logging } = globalConfig;

const logger = winston.createLogger({
    format: environment === 'production' ? winston.format.json() : winston.format.simple(),
    level: logging.level,
    transports: [
        new winston.transports.Console(),
    ],
});

/*
logger.stream = {
    write: function write(message, encoding) {
        logger.info(message);
    },
};
 */

export default logger;
