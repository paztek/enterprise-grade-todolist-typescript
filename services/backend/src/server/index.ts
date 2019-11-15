import { DependencyContainer, inject, injectable, injectAll } from 'tsyringe';

import { Feature } from '../lib/feature';
import { IService } from '../lib/service';
import logger from '../logger';

@injectable()
export default class Server extends Feature {

    constructor(
        @inject('container') container: DependencyContainer,
        @injectAll('dependency') private readonly dependencies: IService[],
        @injectAll('provider') private readonly providers: IService[],
    ) {
        super(container);

        // Register the top-level features
        // this.addChildFeature(ScenarioFeature); // TODO @injectAll()
    }

    public async start(): Promise<void> {
        logger.info('Starting server...');

        // Starting dependencies
        logger.info(`There are ${this.dependencies.length} dependencies...`);
        await Promise.all(this.dependencies.map((dependency) => dependency.start()));

        super.start();

        // Starting provides
        logger.info(`There are ${this.providers.length} providers...`);
        await Promise.all(this.providers.map((provider) => provider.start()));

        logger.info('Server started');
    }

    public async stop(): Promise<void> {
        logger.info('Stopping server...');

        // Stopping provides
        await Promise.all(this.providers.map((provider) => provider.stop()));

        super.stop();

        // Stopping dependencies
        await Promise.all(this.dependencies.map((dependency) => dependency.stop()));

        logger.info('Server stopped');
    }
}
