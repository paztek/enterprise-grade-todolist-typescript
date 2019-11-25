/* tslint:disable:max-classes-per-file */
import bodyParser from 'body-parser';
import express, { Express, NextFunction, Request, Response, Router } from 'express';
import http, {Server} from 'http';
import morgan from 'morgan';
import { inject, injectable } from 'tsyringe';

import { HTTPError } from '../lib/http/errors';
import Service, { IService } from '../lib/service';
import { ILogger } from '../logger';

// tslint:disable-next-line:no-empty-interface
export interface IHTTPService extends IService {
    mountRouter(path: string, router: Router): void;
}

@injectable()
export default class HTTPService extends Service implements IHTTPService {

    public readonly server: Server;

    constructor(
        @inject('express') private readonly app: Express,
        @inject('logger') private readonly logger: ILogger,
    ) {
        super();

        // Configure express app
        this.app.use(morgan('combined', { stream: { write: logger.info.bind(logger) } }));
        this.app.use(bodyParser.json());

        this.server = http.createServer(this.app);
    }

    public async start(): Promise<void> {
        this.logger.info('Starting HTTP server...');

        // Catch 404 and forward to error handler
        this.app.use(() => {
            throw new HTTPError(404, 'Not Found');
        });

        // Error handler
        this.app.use((err: HTTPError, req: Request, res: Response, next: NextFunction) => {
            if (err.stack) {
                this.logger.error(err.stack);
            }

            res.status(err.status || 500).json(err);
        });

        const port = this.app.get('port');

        await new Promise((resolve, reject) => this.server.listen(port, resolve).on('error', reject));

        this.logger.info(`HTTP server started on port ${port}`);
    }

    public async stop(): Promise<void> {
        this.logger.info('Stopping HTTP server...');

        this.server.close();

        this.logger.info('HTTP server stopped');
    }

    public mountRouter(path: string, router: Router): void {
        this.app.use(path, router);
    }
}
