import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { logout, checkAuth } from '../functions'
import CommonNavbar from '../components/CommonNavbar';

function ProfileView() {
    const token = localStorage.getItem("access-token");
    const [name, setName] = useState(localStorage.getItem("username"));
    const [email, setEmail] = useState(localStorage.getItem("email"));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [failureMsg, setFailureMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();
    const SERVER_URL = import.meta.env.VITE_URL;

    async function edit(e){

        e.preventDefault()

        try{
            await checkAuth(navigate);
            const request = await fetch(`${SERVER_URL}/api/users`, {
                method: "PATCH",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
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
            setSuccessMsg("Changes were saved!");
            const newuser = await request.json();
            setName(newuser.name);
            setEmail(newuser.email);
            localStorage.setItem("username", newuser.name);
            localStorage.setItem("email", newuser.email);

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
        <div>
            <CommonNavbar auth={true}/>

            <Sidebar profile={true}/>

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

            <div className="auth-container">
                <div className="auth-card" style={{margin: "1rem"}}>
                    <form className="auth-form" onSubmit={(e) => edit(e)}>
                        <h2>Edit Information</h2>
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
                        />

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <button className="orange-btn" type="submit">Save Changes</button>
                    </form>
                </div>
            </div>
            <footer>
            Created by Gustavo, Assad, Saurav. 2026
            </footer>
        </div>
        
    )
}

export default ProfileView