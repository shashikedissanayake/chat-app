import { User } from '../models/usersModel';

const users: User[] = [
    { id: '1_client', name: 'Shashika', isOnline: false, password: 'abc123' },
    { id: '2_client', name: 'Palinda', isOnline: false, password: 'abc123' },
    { id: '3_client', name: 'Chamod', isOnline: false, password: 'abc123' },
];

const getUserByName = (name: string) => {
    return users.find((user) => {
        return user.name === name;
    });
};

const getUserById = (id: string) => {
    return users.find((user) => {
        return user.id === id;
    });
};

const setIsOnline = (id: string, isOnline: boolean) => {
    const user = users.find((userDetails) => {
        return userDetails.id === id;
    });

    if (!user) {
        throw new Error('User not found');
    }

    user.isOnline = isOnline;
};

const getAllUsers = () => {
    return users.map((user) => {
        return { id: user.id, name: user.name, isOnline: user.isOnline } as Omit<User, 'password'>;
    });
};

export { getUserByName, getUserById, setIsOnline, getAllUsers };
