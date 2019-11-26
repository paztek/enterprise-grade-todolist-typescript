import { Router } from 'express';
import { container, inject, injectable } from 'tsyringe';

import { Feature } from '../../../lib/feature';
import asyncMiddleware from '../../../lib/http/express/middlewares/async';
import { ILogger } from '../../../logger';
import createMiddleware from '../controller/fetch.middleware';
import TodoService from '../service';
import CommentController from './controller';


@injectable()
export default class CommentsFeature extends Feature {

    constructor(
        @inject('logger') private readonly logger: ILogger,
        @inject('/todos') parentRouter: Router,
    ) {
        super();

        const controller = container.resolve(CommentController);

        // Register routes
        const router = Router({ mergeParams: true });

        const todoService = container.resolve(TodoService);
        router.param('todoId', createMiddleware(todoService));

        router.get('/', asyncMiddleware(controller.index));

        parentRouter.use('/:todoId/comments', router);

        // Register the router so that other features can mount nested routers
        container.register('/todos/:id/comments', {
            useValue: router,
        });
    }

    public getName(): string {
        return 'comments';
    }
}
