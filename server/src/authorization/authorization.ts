import * as jwt from 'jsonwebtoken';

export const verifyUser = async (secret: string, socket: any): Promise<any> => {
    if (socket.handshake?.query?.token === undefined) {
        return Promise.reject(new Error('No token provided'));
    }
    try {
        const user = jwt.verify(socket.handshake.query.token, secret);
        return Promise.resolve(user);
    } catch (error) {
        return Promise.reject(error);
    }
};
