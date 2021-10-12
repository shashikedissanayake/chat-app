import { createContext, useState } from "react";
import { ChatContextModel } from "../models/contexts";
import { LastEvaluatedKey, Message } from "../models/messages";
import { User } from "../models/users";

export const ChatContext = createContext<ChatContextModel>({} as ChatContextModel);

const ChatContextProvider = (props: any) => {
    const [users, setUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<LastEvaluatedKey | undefined>(undefined);

    const updateMessages = (message: Message | Message[]) => {
        if (message instanceof Array) {
            setMessages( previousMessages => {
                return [...message, ...previousMessages];
            });
        } else {
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
    }

    const cleanMessages = () => {
        setLastEvaluatedKey(undefined);
        setMessages([]);
    }

    const updateUsers = (users: User | User[]) => {
        console.log(users)
        if (users instanceof Array) {
            setUsers(users);
        } else {
            setUsers( previousUsers => {
                const usersList = [...previousUsers];
                const updatedUser = usersList.find((user) => {
                    return user.id === users.id;
                });
                if (updatedUser) {
                    updatedUser.isOnline = users.isOnline;
                }
                return usersList;
            })
        }
    }

    return (
        <ChatContext.Provider value={{ users, messages, updateUsers, updateMessages, cleanMessages, lastEvaluatedKey, setLastEvaluatedKey }}>
            { props.children }
        </ChatContext.Provider>
    );
}

export default ChatContextProvider;