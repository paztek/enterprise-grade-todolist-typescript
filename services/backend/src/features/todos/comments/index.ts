import { Router } from 'express';
import { container, inject, injectable } from 'tsyringe';

import { IHTTPService } from '../../../http/service';
import { Feature } from '../../../lib/feature';
import asyncMiddleware from '../../../lib/http/express/middlewares/async';
import { ILogger } from '../../../logger';
import CommentController from './controller';


@injectable()
export default class CommentsFeature extends Feature {

    constructor(
        @inject('logger') private readonly logger: ILogger,
        @inject('http') http: IHTTPService,
    ) {
        super();

        const controller = container.resolve(CommentController);

        // Register routes
        const router = Router();

        router.get('/', asyncMiddleware(controller.index));

        http.mountRouter('/todos/:todoId', router);
    }

    public getName(): string {
        return 'comments';
    }
}
