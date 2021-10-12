import { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { io, Socket } from "socket.io-client";
import { MessageTypes } from "../constants/messageStatus";
import { ChatContext } from "../contexts/ChatContext";
import { ChatContextModel } from "../models/contexts";
import { User } from "../models/users";

const useSocket = (url: string, token: string | undefined) => {
    const { messages, updateUsers, updateMessages } = useContext<ChatContextModel>(ChatContext);
    const socketRef = useRef<Socket | undefined>(undefined);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const history = useHistory();

    useEffect(() => {
        if (token) {
            const newSocket = io(url, {
                query: {
                    token,
                },
            });
    
            socketRef.current = newSocket;
    
            newSocket.on('connect', () => {
                console.log('connected');
                console.log(newSocket.id);
                setIsPending(false);
            });
            
            newSocket.on('private-message', (data) => {
                console.log(data)
                console.log(messages);
                if (data?.message?.messageType === MessageTypes.CHAT_MESSAGES) {
                    updateMessages(data.message);
                } else if (data?.message?.messageType === MessageTypes.STATUS_UPDATES) {
                    updateMessages(data.message);
                }
            
            });
            
            newSocket.on('connect_error', (err) => {
                console.log(`error:${err.message}`);
                setIsPending(false);
                setError(err.message);
            });
            
            newSocket.on('user-connected', (data:{ user: User}) => {
                console.log(`users:${JSON.stringify(data)}`);
                updateUsers(data.user);
            });
            
            newSocket.on('user-disconnected', (data:{ user: User}) => {
                console.log(`users:${JSON.stringify(data)}`);
                updateUsers(data.user);
            });
            return () => { newSocket.disconnect() };
        } else {
            history.push('/login');
        }        
    }, [url, token]);

    return { isPending, error, socketRef };
}

export default useSocket;