import { Router } from 'express';
import { container, inject, injectable } from 'tsyringe';

import { IHTTPService } from '../../http/service';
import { Feature } from '../../lib/feature';
import asyncMiddleware from '../../lib/http/express/middlewares/async';
import { ILogger } from '../../logger';
import TodoController from './controller';

@injectable()
export default class TodosFeature extends Feature {

    constructor(
        @inject('logger') private readonly logger: ILogger,
        @inject('http') http: IHTTPService,
    ) {
        super();

        const controller = container.resolve(TodoController);

        // Register routes
        const router = Router();

        router.param('todoId', controller.fetch);

        router.get('/', asyncMiddleware(controller.index));
        router.get('/:todoId', asyncMiddleware(controller.show));

        http.mountRouter('/todos', router);
    }

    public getName(): string {
        return 'todos';
    }
}
