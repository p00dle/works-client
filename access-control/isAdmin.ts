import { AccessControl } from '~/types/access-control';


export const isAdmin: AccessControl = user => user.role === 'admin';