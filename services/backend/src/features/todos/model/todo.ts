import { Persisted } from '../../../lib/provider/persisted';
import { UUID } from '../../../lib/utils/uuid';
import { Taggable } from '../../tags/model';
import { Commentable } from './comment';

// tslint:disable-next-line:interface-name
export interface Todo extends Taggable, Commentable {
    id?: UUID;
    label: string;
    done: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type PersistedTodo = Persisted<Todo>;

export function build(attributes: Partial<Todo> = {}): Todo {
    return { ...getDefaultAttributes(), ...attributes };
}

function getDefaultAttributes(): Todo {
    return {
        label: 'Todo',
        done: false,
        tags: [],
        comments: [],
    }
}
