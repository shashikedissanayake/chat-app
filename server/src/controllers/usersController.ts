import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { User } from '../models/usersModel';
import { getUserByName } from '../db/users';

const { secret } = JSON.parse(fs.readFileSync('./.env.json', 'utf-8'));

const router = express.Router();

router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    const user: User = getUserByName(userName);

    if (!user) {
        return res.json({ code: 422, message: 'User not found' });
    }

    if (password !== user.password) {
        return res.json({ code: 422, message: 'Incorrect password' });
    }

    const token = await jwt.sign({ id: user.id, name: user.name }, secret, {
        expiresIn: '1h',
    });
    return res.json({ code: 200, message: 'success', data: { id: user.id, name: user.name, token } });
});

export default router;
