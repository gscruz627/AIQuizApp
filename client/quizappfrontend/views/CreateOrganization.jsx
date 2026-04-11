import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CommonNavbar from '../components/CommonNavbar';
import { checkAuth } from '../functions';

function CreateOrganization() {
    
    const token = localStorage.getItem("access-token")
    const [orgTitle, setOrgTitle] = useState("");
    const navigate = useNavigate();

    async function createOrganization(e){
        e.preventDefault();
        try{
            await checkAuth(navigate);
            const request = await fetch("https://localhost:7015/api/organizations", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    name: orgTitle
                })
            })
            if(!request.ok){
                alert("Error on creating your organization");

            } else {
                alert("Organization created!");
                navigate("/home")
            }
        } catch(error){
            alert(error.message);
        }
    }
    return (
        <div>
            <CommonNavbar/>

            <Sidebar/>

            <div id="main-box">
                <h1>Create Organization</h1>
                <form onSubmit={(e) => createOrganization(e)}>
                    <label for="orgName">Name: </label>
                    <input className="generate-quiz-numberQuestions" value={orgTitle} onChange={(e) => setOrgTitle(e.target.value)} id="orgName" type="text"></input>
                    <br/><br/><button type="submit" className="orange-btn">Create</button>
                </form>
            </div>
        </div>
    )
}

export default CreateOrganization