import { UUID } from '../utils/uuid';

export type Persisted<T extends {id?: UUID}> = { id: UUID } & T;
