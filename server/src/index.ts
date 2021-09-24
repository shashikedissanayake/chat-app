import * as express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as cors from 'cors';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { verifyUser } from './authorization/authorization';

const PORT = process.env.PORT || 3001;
const { secret } = JSON.parse(fs.readFileSync('./.env.json', 'utf-8'));

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
    res.json({ code: 200, message: 'success' });
});

app.post('/login', async (req, res) => {
    const token = await jwt.sign({ userId: '1_client' }, secret, {
        expiresIn: '1h',
    });
    res.json({ code: 200, message: 'success', data: { token } });
});

const httpServer = createServer(app);

const io = new Server(httpServer);
io.use(async (socket, next) => {
    try {
        const user = await verifyUser(secret, socket);
        socket[user] = user;
        console.log(user);
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

io.on('connection', async (socket) => {
    console.log('conncted:' + socket.id);
});

httpServer.listen(PORT, () => {
    console.log(`Starting server on port ${PORT} ...`);
});
