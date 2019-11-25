import { inject, injectable } from 'tsyringe';

import { IDBService } from './db';
import { IHTTPService } from './http/service';
import BaseServer from './lib/server';
import { ILogger } from './logger';

@injectable()
export default class Server extends BaseServer {

    constructor(
        @inject('logger') private readonly logger: ILogger,
        @inject('db') db: IDBService,
        @inject('http') http: IHTTPService,
    ) {
        super(
            [db],
            [http]
        );
    }

    public async start(): Promise<void> {
        this.logger.info('Starting server...');
        await super.start();
        this.logger.info('Server started');
    }

    public async stop(): Promise<void> {
        this.logger.info('Stopping server...');
        await super.stop();
        this.logger.info('Server stopped');
    }
}
