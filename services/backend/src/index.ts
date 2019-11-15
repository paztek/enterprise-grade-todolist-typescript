// tslint:disable-next-line:no-implicit-dependencies
import 'reflect-metadata';
import { container } from 'tsyringe';

import globalConfig from './config';
import HTTPService from './http/service';
import Server from './server';

const { http } = globalConfig;

// Wire up services
container.register('http', {
    useValue: new HTTPService(http),
});
container.register('provider', {
    useValue: new HTTPService(http),
});

const server = container.resolve(Server);

server.start();
