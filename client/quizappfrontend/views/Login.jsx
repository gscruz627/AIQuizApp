import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"
import CommonNavbar from "../components/CommonNavbar";
function Login() {

    const token = localStorage.getItem("access-token");

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [failureMsg, setFailureMsg] = useState("");

    async function login(e){

        e.preventDefault()

        try{
            const request = await fetch("https://localhost:7015/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    password,
                    email
                })
            });
            if(!request.ok){
                const message = await request.text()
                setFailureMsg(message)
                return;
            }

            const tokens = await request.json();
            const decoded = jwtDecode(tokens.accessToken);
            const email_decoded = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
            const userid = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            localStorage.setItem("access-token", tokens.accessToken);
            localStorage.setItem("refresh-token", tokens.refreshToken);
            localStorage.setItem("username", decoded.name);
            localStorage.setItem("email", email_decoded);
            localStorage.setItem("userid", userid);

            setSuccessMsg("Logged In, Redirecting...")
            navigate("/home")

        } catch(error){
            setFailureMsg(error.message)
            return;
        }
    }

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
                <form className="auth-form" onSubmit={(e) => login(e)}>
                    <h2>Login</h2>

                    <label htmlFor="email">Email</label>
                    <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                    <button className="orange-btn">Log In</button>
                </form>
            </div>
        </div>
        <footer>
            Created by Gustavo, Assad, Saurav. 2026
        </footer>
        </>
    )
}

export default Login