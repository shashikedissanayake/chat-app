import { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { BackendContext } from "../contexts/BackendContext";
import { UserContext } from "../contexts/UserContext";

const LoginComponent = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const url = useContext(BackendContext);
    const { currentUser, setUser } = useContext(UserContext);
    const history = useHistory();

    const handleChangeUserName = (e: any) => {
        setUserName(e.target.value);
    }

    const handleChangePassword = (e: any) => {
        setPassword(e.target.value);
    }

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setIsPending(true);
        fetch(`${url}/users/login`, {
            method: 'POST', 
            headers: { 'Content-type': 'Application/JSON'}, 
            body: JSON.stringify({ userName, password })})
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Login failed');
                }
                return res.json();
            })
            .then((data) => {
                setIsPending(false);
                setError(null);
                setUser({...data.data, isOnline: false });
                history.push('/');
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setIsPending(false);
                    setError(err.message);
                }
            });
    }

    useEffect(() => {
        if (currentUser !== undefined) {
            history.push('/');
        }
    },[currentUser, history]);

    return (
        <form className="login" onSubmit={handleSubmit}>
            <label htmlFor="userName">UserName:</label>
            <input type="text" name="userName" onChange={handleChangeUserName} value={userName} />
            <br/><label htmlFor="password">Password:</label>
            <input type="password" name="password" onChange={handleChangePassword} />
            { !isPending && <button>Login</button> }
            { isPending && <button disabled>Login...</button>}
            { !isPending && error && <p>{ error }</p>}
        </form>
    );
}

export default LoginComponent;