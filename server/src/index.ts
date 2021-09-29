import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import verifyUser from './authorization/authorization';
import usersRoutre from './controllers/usersController';
import { getAllUsers, setIsOnline } from './db/users';
import { Message } from './models/messagesModel';
import { MessageStatus, MessageTypes } from './constants/messageStatus';

const PORT = process.env.PORT || 3001;
const { secret } = JSON.parse(fs.readFileSync('./.env.json', 'utf-8'));

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    res.json({ code: 200, message: 'success' });
});

app.use('/users', usersRoutre);

const httpServer = createServer(app);

const io = new Server(httpServer);
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
    setIsOnline(id, true);
    socket.join(id);
    io.emit('user-connected', { users: getAllUsers() });

    socket.on('private-message', (data, callback) => {
        console.log(data);
        let message: Message;
        let status: string;
        switch (data.messageType as MessageTypes) {
            case MessageTypes.CHAT_MESSAGES: {
                message = {
                    id: uuidv4(),
                    from: id,
                    timestamp: moment().utc().format(),
                    status: MessageStatus.SENT,
                    messageType: MessageTypes.CHAT_MESSAGES,
                    to: data.to,
                    message: data.message,
                };
                status = 'OK';
                break;
            }
            case MessageTypes.STATUS_UPDATES: {
                message = {
                    id: data.id,
                    from: id,
                    timestamp: moment().utc().format(),
                    status: data.status,
                    messageType: MessageTypes.STATUS_UPDATES,
                    to: data.to,
                };
                status = 'OK';
                break;
            }
            default: {
                status = 'FAILED';
                console.log('Unknown message type');
            }
        }
        socket.to(data.to).emit('private-message', { message });

        callback({
            status,
            message,
        });
    });

    socket.on('disconnecting', () => {
        setIsOnline(id, false);
        socket.broadcast.emit('user-disconnected', { users: getAllUsers() });
    });
});

httpServer.listen(PORT, () => {
    console.log(`Starting server on port ${PORT} ...`);
});
