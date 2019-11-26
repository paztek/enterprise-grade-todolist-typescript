import { Router } from 'express';
import { container, inject, injectable } from 'tsyringe';

import { Feature } from '../../lib/feature';
import asyncMiddleware from '../../lib/http/express/middlewares/async';
import { ILogger } from '../../logger';
import TodoController from './controller';

@injectable()
export default class TodosFeature extends Feature {

    constructor(
        @inject('logger') private readonly logger: ILogger,
        @inject('/') parentRouter: Router,
    ) {
        super();

        const controller = container.resolve(TodoController);

        // Register routes
        const router = Router({ mergeParams: true });

        router.param('todoId', controller.fetch);

        router.get('/', asyncMiddleware(controller.index));
        router.post('/', asyncMiddleware(controller.create));
        router.get('/:todoId', asyncMiddleware(controller.read));
        router.put('/:todoId', asyncMiddleware(controller.update));
        router.delete('/:todoId', asyncMiddleware(controller.delete));

        parentRouter.use('/todos', router);

        // Register the router so that other features can mount nested routers
        container.register('/todos', {
            useValue: router,
        });
    }

    public getName(): string {
        return 'todos';
    }
}
