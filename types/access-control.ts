import { User } from './user';

export type AccessControl<P extends Partial<Record<string, string>> = any, U = User> = (user: U, params: P) => boolean;