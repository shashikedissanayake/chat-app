import { useContext, useEffect } from "react";
import { useHistory } from "react-router";
import { BackendContext } from "../contexts/BackendContext";
import { UserContext } from "../contexts/UserContext";
import useSocket from "../hooks/useSocket";
import { UserContextModel } from "../models/contexts";
import MessagesComponent from "./MessagesComponent";
import UsersComponent from "./UsersComponet";

const HomeComponent = () => {
    const url = useContext(BackendContext);
    const { currentUser, selectedUser } = useContext<UserContextModel>(UserContext);
    const { isPending, error, socketRef } = useSocket(url, currentUser?.token);

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
            { !isPending && !error && <UsersComponent />}
            { !isPending && !error && selectedUser && <MessagesComponent socketRef={socketRef} />}
        </div>
    );

}

export default HomeComponent;