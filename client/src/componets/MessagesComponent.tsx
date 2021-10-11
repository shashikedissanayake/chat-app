import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { MessagesSent, StatusSent } from "../models/messages";
import * as moment from 'moment';
import { MessageStatus, MessageTypes } from "../constants/messageStatus";
import { Socket } from "socket.io-client";
import { ChatContextModel, UserContextModel } from "../models/contexts";
import { ChatContext } from "../contexts/ChatContext";
import { useHistory } from "react-router";

const MessagesComponent = ({
    socketRef,
 }: {
     socketRef: { current: Socket | undefined }
}) => {
    const { currentUser, selectedUser } = useContext<UserContextModel>(UserContext);
    const { updateMessages, messages }  = useContext<ChatContextModel>(ChatContext);
    const [message, setMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        if (!currentUser || !selectedUser || !socketRef.current) {
            history.push('/login');
        }
    }, [socketRef, currentUser, selectedUser, history]);

    const sendMessage = (e: any) => {
        e.preventDefault();
        if (selectedUser) {
            const currentMessage: MessagesSent = {
                to: selectedUser.id,
                message,
                messageType: MessageTypes.CHAT_MESSAGES,
            }
            socketRef.current?.emit('private-message', currentMessage, (response: any) => {
                console.log(response);
                if (response.status === 'OK') {
                    updateMessages(response.message);
                }
            });
        }
    }

    const sendStatusUpdate = (messageId: string, timestamp: string, status: MessageStatus) => {
        if (selectedUser && currentUser) {
            const message = messages.find((message) => {
                return message.id === messageId;
            });
            if (message && message?.from !== currentUser.id && message?.status !== status) {
                const currentMessage: StatusSent = {
                    to: selectedUser.id,
                    id: messageId,
                    timestamp,
                    status,
                    messageType: MessageTypes.STATUS_UPDATES,
                };
                socketRef.current?.emit('private-message', currentMessage, (response: any) => {
                    console.log(response);
                    if (response.status === 'OK') {
                        updateMessages({
                            ...message,
                            status: response.message.status,
                        })
                    }
                });
            }
        }
    }

    return (
        <div className="messages-container">
            <div className="messages">
                {
                    messages.filter((message) => {
                        return (message.from === currentUser?.id && message.to === selectedUser?.id) || (message.from === selectedUser?.id && message.to === currentUser?.id);
                    }).map((message) => {
                        return (
                            <div style={{backgroundColor: message.status === MessageStatus.SENT ? 'azure' : 'lightsteelblue'}} onClick={() => sendStatusUpdate(message.id, message.timestamp, MessageStatus.VIEWED)} className={`message${message.from === currentUser?.id ? ' sent':''}`} key={message.id}>
                                <p>{ message.message }</p>
                                <h1>{ message.from === currentUser?.id ? currentUser?.name : selectedUser?.name }</h1>
                                <h2>{ moment.utc(message.timestamp).local().format('YYYY/MM/DD HH:mm:ss') }</h2>
                            </div>
                        );
                    })
                }
            </div>
            <form onSubmit={sendMessage}>
                <input type="text" value={message} onChange={(e) => { setMessage(e.target.value)}} />
                <button>send</button>
            </form>
        </div>
    );
}

export default MessagesComponent;