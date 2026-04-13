import { useState, useEffect } from "react"
import { Link } from "react-router-dom";
import CommonNavbar from "../components/CommonNavbar";
function Register() {

    const token = localStorage.getItem("access-token");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [failureMsg, setFailureMsg] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const SERVER_URL = import.meta.env.VITE_URL;

    async function register(e){

        e.preventDefault()

        try{
            const request = await fetch(`${SERVER_URL}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    name,
                    password,
                    email
                })
            });
            if(!request.ok){
                const message = await request.text()
                setFailureMsg(message)
                return;
            }

            setSuccessMsg("Account Created")

        } catch(error){
            setFailureMsg(error.message)
            return;
        }
    }

    useEffect(() => {

        if(!name && !password && !confirmPassword){
            setFailureMsg("");
            return;
        }

        if(name && name.length < 4){
            setFailureMsg("Set Name to 4 characters plus.");
        }
        else if(password && password.length < 8){
            setFailureMsg("Set Password to 8 characters plus.");
        }
        else if(password && confirmPassword && password !== confirmPassword){
            setFailureMsg("Passwords do not match.");
        }
        else{
            setFailureMsg("");
        }

    }, [name, password, confirmPassword]);


    return (
        <>
        <CommonNavbar auth={true}/>
        {(successMsg != "") && 
            <div className="alert-box green-box">
                <span>{successMsg}</span>
                <button className="alert-close" onClick={() => setSuccessMsg("")}>✕</button>
            </div>
        }
        {(failureMsg != "") && 
            <div className="alert-box red-box">
                <span>{failureMsg}</span>
                <button className="alert-close" onClick={() => setFailureMsg("")}>✕</button>
            </div>
        }
        <div className="auth-container actual-auth">
            <div className="auth-card">
                <form className="auth-form" onSubmit={(e) => register(e)}>
                    <h2>Register</h2>

                    <label htmlFor="email">Email</label>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />

                    <label htmlFor="name">Name</label>
                    <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />

                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    />

                    <button className="orange-btn">Create Account</button>
                </form>
            </div>
        </div>
        <footer>
            Created by Gustavo, Assad, Saurav. 2026
        </footer>
        </>
    )
}

export default Register