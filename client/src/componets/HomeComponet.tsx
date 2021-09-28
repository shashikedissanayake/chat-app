import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { MessageStatus } from "../constants/messageStatus";
import { BackendContext } from "../contexts/BackendContext";
import { UserContext } from "../contexts/UserContext";
import useSocket from "../hooks/useSocket";
import { User } from "../models/users";
import MessagesComponent from "./MessagesComponent";
import UsersComponent from "./UsersComponet";

const HomeComponent = () => {
    const url = useContext(BackendContext);
    const { currentUser } = useContext(UserContext);
    const { isPending, error, messages, users, sendMessages, sendStatusUpdate } = useSocket(url, currentUser?.token);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    
    const sendMessage = (message: string) => {
        if (selectedUser) {
            sendMessages(selectedUser.id, message);
        }
    }

    const sendStatusChange = (id: string, status: MessageStatus) => {
        if (selectedUser) {
            const message = messages.find((message) => {
                return message.id === id;
            });
            if (message?.status !== status && message?.from !== currentUser.id) {
                sendStatusUpdate(selectedUser?.id, id, status);
            }
        }
    }

    const selectUser = (id: string) => {
        const user = users.find((user) => { return user.id === id });
        if (user) {
            setSelectedUser(user);
        }
    }
    const history = useHistory();

    useEffect(() => {
        if (!currentUser) {
            history.push('/login');
        }
    }, [currentUser, history]);

    return (
        <div className="container">
            { isPending && <div>Loading...</div> }
            { !isPending && error && <div> { error }</div> }
            { !isPending && users.length > 0 && <UsersComponent users={users} handleClick={selectUser} selectedUser={selectedUser} />}
            { !isPending && users.length > 0  && selectedUser && <MessagesComponent sendMessageStatus={sendStatusChange} messages={messages.filter((message) => {
                return (message.from === currentUser.id && message.to === selectedUser.id) || (message.from === selectedUser.id && message.to === currentUser.id);
            })} sendMessage={sendMessage} selectedUser={selectedUser} />}
        </div>
    );

}

export default HomeComponent;