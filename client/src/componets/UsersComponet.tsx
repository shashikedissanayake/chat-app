import { useContext } from "react";
import { ChatContext } from "../contexts/ChatContext";
import { UserContext } from "../contexts/UserContext";
import { ChatContextModel, UserContextModel } from "../models/contexts";

const UsersComponent = () => {
    const { selectedUser, setSelectedUser, setSelectedRoomId, currentUser } = useContext<UserContextModel>(UserContext);
    const { users } = useContext<ChatContextModel>(ChatContext);

    const handleClick = (id: string) => {
        const user = users.find((user) => {
            return user.id === id;
        });

        if (user && currentUser) {
            setSelectedUser(user);
            setSelectedRoomId(currentUser.id > user.id ? `${currentUser.id}-${user.id}` : `${user.id}-${currentUser.id}`);
        }
    }

    return (
        <div className="users">
            {
                users?.map((user) => {
                    return (
                        <div className={`user${user?.id === selectedUser?.id ? ' selected':''}`} key={user.id} onClick={(e) => {e.preventDefault(); handleClick(user.id)}}>
                            <h2>{ user.name }</h2>
                            <span className={ user.isOnline ? "logged-in": "logged-out"}>●</span><p>- { user.isOnline ? "logged-in": "logged-out" }</p>
                        </div>
                    );
                })
            }
        </div>
    );
}

export default UsersComponent;