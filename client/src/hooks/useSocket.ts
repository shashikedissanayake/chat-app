import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = <UserType, MessageType>(url: string, token: string) => {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [users, setUsers] = useState<UserType[]>([]);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sendMessages = (to: string, message: string) => {
        socket?.emit('private-message', { to, message }, (response: any) => {
            console.log(response);
            setMessages([...messages, response.data]);
        });
    }

    useEffect(() => {
        const newSocket = io(url, {
            query: {
                token,
            },
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('connected');
            console.log(newSocket.id);
            setIsPending(false);
        });
        
        newSocket.on('private-message', (data) => {
            console.log(data)
            console.log(messages);
            setMessages( previousMessages => {
                return [
                  ...previousMessages,
                  data.data
                ]});
        });
        
        newSocket.on('connect_error', (err) => {
            console.log(`error:${err.message}`);
            setIsPending(false);
            setError(err.message);
        });
        
        newSocket.on('user-connected', (data:{ users: UserType[]}) => {
            console.log(`users:${JSON.stringify(data)}`);
            setUsers(data.users);
        });
        
        newSocket.on('user-disconnected', (data:{ users: UserType[]}) => {
            console.log(`users:${JSON.stringify(data)}`);
            setUsers(data.users);
        });
        return () => { newSocket.disconnect() };
    }, [url, token]);

    return { users, messages, isPending, error, sendMessages };
}

export default useSocket;