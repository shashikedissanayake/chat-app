import { User } from "../models/users";

const UsersComponent = ({ 
    users, 
    handleClick, 
    selectedUser 
}: { 
    users: User[], 
    handleClick: (id: string) => void, 
    selectedUser: User | undefined,
}) => {
  
    return (
        <div className="users">
            {
                users.map((user) => {
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