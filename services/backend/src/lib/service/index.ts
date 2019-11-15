import { IStartable, IStoppable } from '../utils/lifecycle';

type Initializer = () => any;

export interface IService extends IStartable, IStoppable {
    //registerInitializer(initializer: Initializer): void;
}

export default abstract class Service implements IService {

    private readonly initializers: Initializer[] = [];

    public async init(): Promise<void> {
        this.initializers.forEach((initializer) => initializer());
    }

    public abstract async start(): Promise<void>;
    public abstract async stop(): Promise<void>;

    /*
    public registerInitializer(initializer: () => any): void {
        this.initializers.push(initializer);
    }
     */

}
