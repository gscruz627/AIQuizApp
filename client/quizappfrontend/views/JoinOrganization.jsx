import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useEffect } from 'react';
import { logout, checkAuth } from '../functions';
import CommonNavbar from '../components/CommonNavbar';

function JoinOrganization() {

    const [joinCode, setJoinCode] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);
    const [failMessage, setFailMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const token = localStorage.getItem('access-token');
    const navigate = useNavigate();

    async function join(e){
        e.preventDefault();
        try{
            await checkAuth(navigate);
            const request = await fetch("https://localhost:7015/api/memberships/join", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    joinCode
                })
            })
            if (!request.ok) {
                const errorMessage = await request.text();
                alert(errorMessage);
                return;
            }
            const info = await request.json();
            alert("join requested!");
            loadPendingRequests();

        } catch(error){
            alert(error.message);
        }
    }

    async function cancelJoinRequest(joinrequestid){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinrequestid}`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                }, body: JSON.stringify({
                    "action": "Cancel"
                })
            })
            if(request.ok){
                alert("canceled")
                await loadPendingRequests();
            } else{
                alert("failed to cancel request.")
            }
        }   catch(error){
            alert(error.message);
        }
    }

    async function loadPendingRequests(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/joinrequests?userId=${localStorage.getItem("userid")}`, {
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                }
            })
            const info = await request.json();
            setPendingRequests(info);
        } catch(error){
            alert(error);
        }
    }

    useEffect( () => {
        loadPendingRequests();
    }, [])
    return (
        <div>
            <CommonNavbar/>

            <Sidebar/>

            <div id="main-box">
                <h1>Join Organization</h1>

                <form onSubmit={(e) => join(e)}>
                    <label for="code">Join Code: </label><br/>
                    <input className="generate-quiz-numberQuestions" id="code" placeholder="ie. 123456" value={joinCode} onChange={(e) => setJoinCode(e.target.value)}/>
                    <br/><br/><button type="submit" className="orange-btn">Join</button>
                </form><br/>

                <h2>Pending Join Requests</h2>
                {pendingRequests && pendingRequests.map( (p) => (
                    <div className='members-box'>
                        <p>{p.orgName}</p>
                        <button className="red-btn" onClick={() => cancelJoinRequest(p.id)}>Cancel</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default JoinOrganization