import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { Message } from "../models/messages";
import { User } from "../models/users";
import * as moment from 'moment';

const MessagesComponent = ({ 
    messages, 
    sendMessage,
    selectedUser,
 }: { 
     messages: Message[], 
     sendMessage: (message: string) => void,
     selectedUser: User,
}) => {
    const { currentUser } = useContext(UserContext);
    const [message, setMessage] = useState('');
    return (
        <div className="messages-container">
            <div className="messages">
                {
                    messages.map((message) => {
                        return (
                            <div className={`message${message.from === currentUser.id ? ' sent':''}`} key={message.id}>
                                <p>{ message.message }</p>
                                <h1>{ message.from === currentUser.id ? currentUser.name : selectedUser.name }</h1>
                                <h2>{ moment.utc(message.timestamp).local().format('YYYY/MM/DD HH:mm:ss') }</h2>
                            </div>
                        );
                    })
                }
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(message); setMessage(''); }}>
                <input type="text" value={message} onChange={(e) => { setMessage(e.target.value)}} />
                <button>send</button>
            </form>
        </div>
    );
}

export default MessagesComponent;