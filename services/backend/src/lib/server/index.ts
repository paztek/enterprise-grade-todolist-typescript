import * as _ from 'lodash';
import { container, DependencyContainer } from 'tsyringe';

import { Feature, FeatureConfig, FeaturesConfig } from '../feature';
import { IService } from '../service';
import { IStartable, IStoppable } from '../utils/lifecycle';
import { Newable } from '../utils/newable';

export default class Server implements IStartable, IStoppable {

    /**
     * Flattened array of all the mounted features
     */
    private features: Feature[];

    constructor(
        private readonly dependencies: IService[],
        private readonly provides: IService[],
    ) {}

    public resolveFeatures(featuresConfig: FeaturesConfig): void {

        function buildFeatures(parentContainer: DependencyContainer, configs: FeaturesConfig): Feature[] {
            return _.flatten(configs.map((config) => {
                let features: Feature[] = [];

                if (isFeatureClass(config)) {
                    features.push(parentContainer.resolve(config));
                } else {
                    features.push(parentContainer.resolve(config.feature));

                    if (config.children) {
                        const childContainer = parentContainer.createChildContainer();
                        const childrenFeatures = buildFeatures(childContainer, config.children);
                        features = features.concat(childrenFeatures);
                    }
                }

                return features;
            }));
        }

        this.features = buildFeatures(container, featuresConfig);
    }

    public async start(): Promise<void> {
        await Promise.all(this.dependencies.map((d) => d.start()));
        await Promise.all(this.provides.map((p) => p.start()));
    }

    public async stop(): Promise<void> {
        await Promise.all(this.provides.map((p) => p.stop()));
        await Promise.all(this.dependencies.map((d) => d.stop()));
    }

    public getName(): string {
        return 'server';
    }
}

function isFeatureClass(featureConfig: FeatureConfig): featureConfig is Newable<Feature> {
    return typeof featureConfig === 'function';
}
