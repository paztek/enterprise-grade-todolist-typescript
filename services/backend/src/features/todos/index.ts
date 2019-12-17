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

        router.param('todoId', controller.fetchTodo);

        router.get('/', asyncMiddleware(controller.getTodos));
        router.post('/', asyncMiddleware(controller.createTodo));
        router.get('/:todoId', asyncMiddleware(controller.getTodo));
        router.put('/:todoId', asyncMiddleware(controller.updateTodo));
        router.delete('/:todoId', asyncMiddleware(controller.deleteTodo));
        router.post('/:todoId/comments', asyncMiddleware(controller.createTodoComment));

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
