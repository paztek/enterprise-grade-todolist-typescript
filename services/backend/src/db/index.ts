import { InitOptions, Model, ModelAttributes, ModelCtor, ModelOptions, Options, Sequelize } from 'sequelize';

import Service, { IService } from '../lib/service';
import logger from '../logger';
import { IDBConfig } from './config';

// tslint:disable-next-line:no-empty-interface
export interface IDBService extends IService {
}

export default class DBService extends Service implements IDBService {

    public readonly sequelize: Sequelize;

    constructor(
        private config: IDBConfig,
    ) {
        super();

        // Create and configure sequelize
        const SEQUELIZE_OPTIONS: Options = {
            define: {
                underscored: true,
            },
            logging: function log(...args: any[]) { logger.debug(args); },
        };
        this.sequelize = new Sequelize(this.config.uri, SEQUELIZE_OPTIONS);
    }

    public async start(): Promise<void> {
        logger.info('Connecting to Postgres database...');

        super.init();

        await this.sequelize.authenticate();

        // TODO Register models (injected via @injectAll)

        logger.info('Connected to Postgres database');
    }

    public async stop(): Promise<void> {
        logger.info('Disconnecting from Postgres database...');

        await this.sequelize.close();

        logger.info('Disconnected from Postgres database');
    }
}
