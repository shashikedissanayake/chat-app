import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { MessageStatus, MessageTypes } from "../constants/messageStatus";
import { Message, MessagesSent, StatusSent } from "../models/messages";
import { User } from "../models/users";

const useSocket = (url: string, token: string) => {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sendMessages = (to: string, message: string) => {
        const currentMessage: MessagesSent = {
            to,
            message,
            messageType: MessageTypes.CHAT_MESSAGES,
        };
        console.log(currentMessage)
        socket?.emit('private-message', currentMessage, (response: any) => {
            console.log(response);
            if (response.status === 'OK') {
                setMessages([...messages, response.message]);
            }
        });
    }

    const sendStatusUpdate = (to: string, id: string, status: MessageStatus) => {
        const currentMessage: StatusSent = {
            to,
            id,
            status,
            messageType: MessageTypes.STATUS_UPDATES,
        };
        socket?.emit('private-message', currentMessage, (response: any) => {
            console.log(response);
            if (response.status === 'OK') {
                const newMessages = [...messages];
                const message = newMessages.find((message) => {
                    return message.id === response.message.id;
                });
                if (message) {
                    message.status = response.message.status;
                }
                setMessages(newMessages);
            }
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
            if (data?.message?.messageType === MessageTypes.CHAT_MESSAGES) {
                setMessages( previousMessages => {
                    return [
                      ...previousMessages,
                      data.message
                    ]});
            } else if (data?.message?.messageType === MessageTypes.STATUS_UPDATES) {
                setMessages( previousMessages => {
                    const newMessages = [...previousMessages];
                    const message = newMessages.find((message) => {
                        return message.id === data.message.id;
                    });
                    if (message) {
                        message.status = data.message.status;
                    }
                    return newMessages;
                });
            }
        
        });
        
        newSocket.on('connect_error', (err) => {
            console.log(`error:${err.message}`);
            setIsPending(false);
            setError(err.message);
        });
        
        newSocket.on('user-connected', (data:{ users: User[]}) => {
            console.log(`users:${JSON.stringify(data)}`);
            setUsers(data.users);
        });
        
        newSocket.on('user-disconnected', (data:{ users: User[]}) => {
            console.log(`users:${JSON.stringify(data)}`);
            setUsers(data.users);
        });
        return () => { newSocket.disconnect() };
    }, [url, token]);

    return { users, messages, isPending, error, sendMessages, sendStatusUpdate };
}

export default useSocket;