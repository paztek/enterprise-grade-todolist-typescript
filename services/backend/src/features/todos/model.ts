import { UUID } from '../../lib/utils/uuid';

export interface ITodo {
    id: UUID;
    label: string;
    done: boolean;
    createdAt: Date;
    updatedAt: Date;
}
