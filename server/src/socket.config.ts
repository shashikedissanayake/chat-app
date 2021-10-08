import { Server } from 'http';
import * as fs from 'fs';
import { Server as SocketServer } from 'socket.io';
import verifyUser from './authorization/authorization';
import { Message, MessageDeliveyRecord } from './models/messagesModel';
import { MessageStatus } from './constants/messageStatus';
import { UserService } from './services/usersService';
import { UserDetails } from './models/usersModel';
import { MessagesService } from './services/messagesService';

const { secret } = JSON.parse(fs.readFileSync('./.env.json', 'utf-8'));

const createSocketServer = (server: Server, userService: UserService, messageService: MessagesService): void => {
    const io = new SocketServer(server);
    io.use(async (socket, next) => {
        try {
            const user = await verifyUser(secret, socket);
            // eslint-disable-next-line no-param-reassign
            socket.handshake.auth.user = user;
            next();
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    });

    io.on('connection', async (socket) => {
        console.log(`conncted:${socket.id}`);
        console.log(socket.handshake.auth.user);
        const { id } = socket.handshake.auth.user;
        const updatedUser: UserDetails = await userService.setOnline(id, true);
        socket.join(id);
        socket.broadcast.emit('user-connected', { user: updatedUser });
        socket.emit('connected-success', { users: await userService.getAllUsers() });

        socket.on('private-message', async (data, callback) => {
            console.log(data);

            try {
                const roomId = data.to < id ? `${id}-${data.to}` : `${data.to}-${id}`;
                const message: Message | MessageDeliveyRecord = await messageService.storeMessage(
                    roomId,
                    data.to,
                    id,
                    data.messageType,
                    data.message,
                    data.id,
                    data.status ?? MessageStatus.SENT,
                );
                socket.to(data.to).emit('private-message', { message });

                callback({
                    status: 'OK',
                    message,
                });
            } catch (error) {
                callback({
                    status: 'FAILED',
                });
            }
        });

        // socket.on('join-chatroom', async (data, callback) => {
        //     callback({
        //         status: 'OK',

        //     });
        // });

        socket.on('disconnecting', async () => {
            const user: UserDetails = await userService.setOnline(id, false);
            socket.broadcast.emit('user-disconnected', { user });
        });
    });
};

export { createSocketServer };
