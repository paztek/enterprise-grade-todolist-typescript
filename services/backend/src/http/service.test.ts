import { expect } from 'chai';
import { agent, SuperTest, Test } from 'supertest';

import globalConfig from '../config';
import HTTPService from './service';

const { http } = globalConfig;

describe('HTTP Service', () => {

    let service: HTTPService;
    let client: SuperTest<Test>;

    describe('Start', () => {

        // TODO Routes from features should be loaded
    });
});
