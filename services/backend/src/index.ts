// tslint:disable-next-line:no-implicit-dependencies
import express from 'express';
import 'reflect-metadata';
import { Sequelize } from 'sequelize';
import { container } from 'tsyringe';

import globalConfig from './config';
import DBService from './db';
import TagsFeature from './features/tags';
import TodosFeature from './features/todos';
import HTTPService from './http/service';
import { FeaturesConfig } from './lib/feature';
import Server from './lib/server';
import logger from './logger';

const { http, db } = globalConfig;

// ---------------- Wire up services ----------------

// Dependencies
container.register('logger', {
    useValue: logger,
});

const app = express();
app.set('port', http.port);
container.register('express', {
    useValue: app,
});

const sequelize = new Sequelize(db.uri, {
    define: {
        underscored: true,
    },
    logging: function log(message) { logger.debug(message); },
});
container.register('sequelize', {
    useValue: sequelize,
});

container.register('http', {
    useClass: HTTPService,
});
container.register('db', {
    useClass: DBService,
});

// Features
const featuresConfig: FeaturesConfig = [
    {
        feature: TodosFeature,
        children: [],
    },
    TagsFeature,
];

const server = container.resolve(Server);
server.resolveFeatures(featuresConfig);
server.start();
