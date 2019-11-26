import uuid from 'uuid';

import { ITodo } from './model';

export default function build(attributes: Partial<ITodo> = {}): ITodo {
    return {
        id: attributes.id || uuid(),
        label: attributes.label || 'Todo',
        done: attributes.done || false,
    };
}
