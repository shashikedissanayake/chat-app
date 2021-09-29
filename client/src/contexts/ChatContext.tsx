import { createContext, useState } from "react";
import { ChatContextModel } from "../models/contexts";
import { Message } from "../models/messages";
import { User } from "../models/users";

export const ChatContext = createContext<ChatContextModel>({} as ChatContextModel);

const ChatContextProvider = (props: any) => {
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const updateMessages = (message: Message) => {

        setMessages( previousMessages => {
            const newMessages = [...previousMessages];
            const newMessage = newMessages.find((item) => {
                return message.id === item.id;
            });
            if (newMessage) {
                newMessage.status = message.status;
            } else {
                newMessages.push(message);
            }
            return newMessages;
        });
    }

    return (
        <ChatContext.Provider value={{ users, messages, setUsers, updateMessages }}>
            { props.children }
        </ChatContext.Provider>
    );
}

export default ChatContextProvider;