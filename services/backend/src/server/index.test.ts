import { expect } from 'chai';
import 'reflect-metadata';
import Sinon from 'sinon';
import { container } from 'tsyringe';

import { IService } from '../lib/service';
import Server from './index';

class Service implements IService {

    // tslint:disable-next-line:no-empty
    public async start(): Promise<void> {}

    // tslint:disable-next-line:no-empty
    public async stop(): Promise<void> {}
}

const Dependency = Service;
const Provider = Service;

describe('Server', () => {

    let server: Server;

    beforeEach(() => {
        container.register('container', {
            useValue: container,
        });
    });

    afterEach(() => {
        container.reset();
    });

    describe('Start', () => {

        it('should start its dependencies', async () => {
            const dependency1 = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency1,
            });
            const dependency2 = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency2,
            });
            // We have to provide at least one provider
            const provider = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider,
            });

            server = container.resolve(Server);
            await server.start();

            expect(dependency1.start).to.have.been.calledOnce;
            expect(dependency2.start).to.have.been.calledOnce;
        });

        it('should start its providers', async () => {
            // We have to provide at least one dependency
            const dependency = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency,
            });

            const provider1 = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider1,
            });
            const provider2 = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider2,
            });

            server = container.resolve(Server);
            await server.start();

            expect(provider1.start).to.have.been.calledOnce;
            expect(provider2.start).to.have.been.calledOnce;
        });

        it('should start its providers after the dependencies', async () => {
            const dependency = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency,
            });

            const provider = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider,
            });

            server = container.resolve(Server);
            await server.start();

            expect(provider.start).to.have.been.calledAfter(dependency.start);
        });
    });

    describe('Stop', () => {

        it('should stop its providers', async () => {
            // We have to provide at least one dependency
            const dependency = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency,
            });

            const provider1 = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider1,
            });
            const provider2 = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider2,
            });

            server = container.resolve(Server);
            await server.stop();

            expect(provider1.stop).to.have.been.calledOnce;
            expect(provider2.stop).to.have.been.calledOnce;
        });

        it('should stop its dependencies', async () => {
            const dependency1 = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency1,
            });
            const dependency2 = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency2,
            });
            // We have to provide at least one provider
            const provider = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider,
            });

            server = container.resolve(Server);
            await server.stop();

            expect(dependency1.stop).to.have.been.calledOnce;
            expect(dependency2.stop).to.have.been.calledOnce;
        });

        it('should stop its dependencies after the providers', async () => {
            const dependency = Sinon.createStubInstance(Dependency);
            container.register('dependency', {
                useValue: dependency,
            });

            const provider = Sinon.createStubInstance(Provider);
            container.register('provider', {
                useValue: provider,
            });

            server = container.resolve(Server);
            await server.stop();

            expect(dependency.stop).to.have.been.calledAfter(provider.stop);
        });
    });
});
