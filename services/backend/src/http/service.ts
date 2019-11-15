/* tslint:disable:max-classes-per-file */
import bodyParser from 'body-parser';
import express, { Express, NextFunction, Request, Response} from 'express';
import http, {Server} from 'http';
import morgan from 'morgan';

import { HTTPError } from '../lib/http/errors';
import Service, { IService } from '../lib/service';
import logger from '../logger';
import { IHTTPConfig } from './config';

// tslint:disable-next-line:no-empty-interface
export interface IHTTPService extends IService {
}

export default class HTTPService extends Service implements IHTTPService {

    public readonly server: Server;
    public readonly app: Express;

    constructor(
        private config: IHTTPConfig,
    ) {
        super();

        // Create and configure express app
        this.app = express();
        this.app.use(morgan('combined', { stream: { write: logger.info.bind(logger) } }));
        this.app.use(bodyParser.json());

        this.server = http.createServer(this.app);

        // TODO Register routers (injected via @injectAll)
    }

    public async start(): Promise<void> {
        logger.info('Starting HTTP server...');

        // Catch 404 and forward to error handler
        this.app.use(() => {
            throw new HTTPError(404, 'Not Found');
        });

        // Error handler
        this.app.use((err: HTTPError, req: Request, res: Response, next: NextFunction) => {
            if (err.stack) {
                logger.error(err.stack);
            }

            res.status(err.status || 500).json(err);
        });

        await new Promise((resolve, reject) => this.server.listen(this.config.port, resolve).on('error', reject));

        logger.info(`HTTP server started on port ${this.config.port}`);
    }

    public async stop(): Promise<void> {
        logger.info('Stopping HTTP server...');

        this.server.close();

        logger.info('HTTP server stopped');
    }
}
