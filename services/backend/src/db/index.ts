import { InitOptions, Model, ModelAttributes, ModelCtor, ModelOptions, Options, Sequelize } from 'sequelize';
import { inject, injectable } from 'tsyringe';

import Service, { IService } from '../lib/service';
import { ILogger } from '../logger';

// tslint:disable-next-line:no-empty-interface
export interface IDBService extends IService {
}

@injectable()
export default class DBService extends Service implements IDBService {

    constructor(
        @inject('sequelize') private readonly sequelize: Sequelize,
        @inject('logger') private readonly logger: ILogger,
    ) {
        super();
    }

    public async start(): Promise<void> {
        this.logger.info('Connecting to Postgres database...');

        super.init();

        await this.sequelize.authenticate();

        // TODO Register models (injected via @injectAll)

        this.logger.info('Connected to Postgres database');
    }

    public async stop(): Promise<void> {
        this.logger.info('Disconnecting from Postgres database...');

        await this.sequelize.close();

        this.logger.info('Disconnected from Postgres database');
    }
}
