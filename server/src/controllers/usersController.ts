import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { User } from '../models/usersModel';
import { UserService } from '../services/usersService';
import { MessagesService } from '../services/messagesService';

const { secret } = JSON.parse(fs.readFileSync('./.env.json', 'utf-8'));

function userRoutes(userService: UserService, messageService: MessagesService): express.Router {
    const router = express.Router();

    router.post('/login', async (req, res) => {
        const { userId, password } = req.body;

        const user: User = await userService.getUserById(userId);

        if (!user) {
            return res.json({ code: 422, message: 'User not found' });
        }

        if (password !== user.password) {
            return res.json({ code: 422, message: 'Incorrect password' });
        }

        const token = await jwt.sign({ id: user.id, name: user.name }, secret, {
            expiresIn: '1h',
        });
        return res.json({
            code: 200,
            message: 'success',
            data: { id: user.id, name: user.name, token, users: await userService.getAllUsers() },
        });
    });

    router.post('/chat/:roomId', async (req, res) => {
        const { roomId } = req.params;
        const { lastEvaluatedKey: lastKey, pageSize } = req.body;
        if (!roomId || pageSize === undefined) {
            return res.json({
                code: 422,
                message: 'required fields : User Id, room id, pageSize',
            });
        }

        const { messages, lastEvaluatedKey } = await messageService.getMessagesByRoomId(roomId, pageSize, lastKey);

        return res.json({
            code: 200,
            message: 'success',
            data: {
                messages: messages.sort((a, b) => {
                    return a.timestamp < b.timestamp ? -1 : 1;
                }),
                lastEvaluatedKey,
            },
        });
    });

    return router;
}

export default userRoutes;
