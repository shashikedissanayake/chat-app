import * as express from 'express';
import { createServer } from 'http';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import usersRouter from './controllers/usersController';
import { container } from './inversify.config';
import { UserService } from './services/usersService';
import { createSocketServer } from './socket.config';
import { MessagesService } from './services/messagesService';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    res.json({ code: 200, message: 'success' });
});

const userService = container.resolve<UserService>(UserService);
const messageService = container.resolve<MessagesService>(MessagesService);
app.use('/users', usersRouter(userService, messageService));
const httpServer = createServer(app);

createSocketServer(httpServer, userService, messageService);

httpServer.listen(PORT, () => {
    console.log(`Starting server on port ${PORT} ...`);
});
