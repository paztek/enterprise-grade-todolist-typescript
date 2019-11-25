import { Newable } from '../utils/newable';

/**
 * Composable feature
 */
export abstract class Feature {
    public abstract getName(): string;
}

export interface IFeatureConfig {
    feature: Newable<Feature>;
    children?: FeatureConfig[];
}

export type FeatureConfig = IFeatureConfig | Newable<Feature>;

export type FeaturesConfig = FeatureConfig[];
