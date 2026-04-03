import { Branded } from './types';

export type Uuid = Branded<string, 'Uuid'>;
export type ID = Branded<string, 'ID'>;
export type IdIncrement = Branded<string, 'IdIncrement'>;
