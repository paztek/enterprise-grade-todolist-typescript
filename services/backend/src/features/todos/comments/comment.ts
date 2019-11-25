import { UUID } from '../../../lib/utils/uuid';

export interface IComment {
    id: UUID;
    text: string;
    createdAt: Date;
}
