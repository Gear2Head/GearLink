// utils/adminAuth.ts
// Admin authentication helper - only senerkadiralper@gmail.com has access

import { ADMIN_EMAIL } from '../constants/config';

export const isAdmin = (userEmail: string): boolean => {
    return userEmail === ADMIN_EMAIL;
};

export const checkAdminAccess = (userEmail: string): void => {
    if (!isAdmin(userEmail)) {
        throw new Error('Unauthorized: Admin access required');
    }
};
