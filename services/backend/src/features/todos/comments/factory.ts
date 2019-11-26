import uuid from 'uuid';

import { IComment } from './model';

export default function build(attributes: Partial<IComment> = {}): IComment {
    return {
        id: attributes.id || uuid(),
        text: attributes.text || 'Lorem ipsum...',
    };
}
