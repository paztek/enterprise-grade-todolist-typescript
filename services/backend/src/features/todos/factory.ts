import uuid from 'uuid';

import { Todo } from './model';

export default function build(attributes: Partial<Todo> = {}): Todo {
    return { ...getDefaultAttributes(), ...attributes };
}

function getDefaultAttributes(): Todo {
    return {
        label: 'Todo',
        done: false,
        tags: [],
    }
}
