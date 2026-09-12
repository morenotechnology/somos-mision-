export const canPublish = user => Boolean(user && user.active !== false && (user.role === 'admin' || user.canPublish === true));
export const isSuperadmin = user => Boolean(user && user.active !== false && user.role === 'admin');
