import { Persisted } from '../../lib/provider/persisted';
import { UUID } from '../../lib/utils/uuid';
import { ITaggable } from '../tags/model';

// tslint:disable-next-line:interface-name
export interface Todo extends ITaggable {
    id?: UUID;
    label: string;
    done: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type PersistedTodo = Persisted<Todo>;
