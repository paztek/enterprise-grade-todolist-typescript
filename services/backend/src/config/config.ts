import { IDBConfig } from '../db/config';
import { IHTTPConfig } from '../http/config';
import { ILoggingConfig } from '../logger/config';

export interface IConfig {
    environment: string;
    logging: ILoggingConfig;
    http: IHTTPConfig;
    db: IDBConfig;
}
