import { DependencyContainer } from 'tsyringe';

import { IStartable, IStoppable } from '../utils/lifecycle';
import { Newable } from '../utils/newable';

/**
 * Composable feature
 */
export abstract class Feature implements IStartable, IStoppable {

    private childFeatures: Feature[] = [];

    constructor(
        private container: DependencyContainer,
    ) {}

    public async start(): Promise<void> {
        await Promise.all(this.childFeatures.map((childFeature) => childFeature.start()));
    }

    public async stop(): Promise<void> {
        await Promise.all(this.childFeatures.map((childFeature) => childFeature.stop()));
    }

    /**
     * Adds a child feature.
     * This child feature will start after the feature is started and stop before the feature is stopped
     */
    protected addChildFeature<T extends Feature>(childFeatureClass: Newable<T>): T {
        // Create a child container for this feature
        const childContainer = this.container.createChildContainer();
        childContainer.register('root', {
            useValue: childContainer,
        });

        // Build the feature
        const childFeature = childContainer.resolve(childFeatureClass);
        this.childFeatures.push(childFeature);

        return childFeature;
    }
}

export function buildFeature<F>(parentContainer: DependencyContainer, f: Newable<F>): F {
    const childContainer = parentContainer.createChildContainer();
    childContainer.register('container', {
        useValue: childContainer,
    });

    return childContainer.resolve(f);
}
