import uuid from 'uuid';

import { ITodo } from './model';

export default function build(attributes: Partial<ITodo> = {}): ITodo {
    return { ...getDefaultAttributes(), ...attributes };
}

function getDefaultAttributes(): ITodo {
    return {
        id: uuid(),
        label: 'Todo',
        done: false,
    }
}
