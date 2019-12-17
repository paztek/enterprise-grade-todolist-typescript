/* tslint:disable:interface-name */
import { Persisted } from '../../../lib/provider/persisted';
import { UUID } from '../../../lib/utils/uuid';

export interface Comment {
    id?: UUID;
    text: string;
    createdAt?: Date;
}

export type PersistedComment = Persisted<Comment>;

export interface Commentable {
    comments: Comment[];
}

export function build(attributes: Partial<Comment> = {}): Comment {
    return { ...getDefaultAttributes(), ...attributes };
}

function getDefaultAttributes(): Comment {
    return {
        text: 'Comment',
    };
}
