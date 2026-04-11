import React, {useState, useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { logout, checkAuth } from '../functions';
import QuizBox from '../components/QuizBox';
import CommonNavbar from '../components/CommonNavbar';

function Organization() {

    const token = localStorage.getItem("access-token")
    const [organizationName, setOrganizationName] = useState("");
    const [organizationRole, setOrganizationRole] = useState("");
    const [organizationJoinCode, setOrganizationJoinCode] = useState("");
    const [organizationMembers, setOrganizationMembers] = useState([]);
    const [searchParams] = useSearchParams();
    const [joinRequests, setJoinRequests] = useState([]);
    const [orgQuizzes, setOrgQuizzes] = useState([]);
    const organizationId = searchParams.get("organizationId");

    const navigate = useNavigate();

    async function allowRequest(joinRequestId, role) {
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinRequestId}`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    action: "Allow",
                    role
                })
            });
            await loadJoinRequests();
            alert("Accepted.")
        } catch(error){
            alert(error);
        }
    }

    async function denyRequest(joinRequestId) {
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinRequestId}`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                },
                body: JSON.stringify({
                    action: "Deny"
                })
            });
            await loadJoinRequests();
        } catch(error){
            alert(error);
        }
    }

    async function loadOrgInfo(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/organizations/${organizationId}`, {
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            const response = await request.json();
            setOrganizationName(response.name);
            setOrganizationRole(response.role);
            setOrganizationMembers(response.members);
            setOrganizationJoinCode(response.joinCode);

        } catch(error){
            alert(error.message);
        }
    }


    async function loadOrgQuizzes(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/quizes?organizationId=${organizationId}&limit=5`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(!request.ok){
                alert("Failed to load quizes.");
                return;
            }
            const quizes = await request.json();
            setOrgQuizzes(quizes);
        } catch(error){
            alert(error);
        }
    }

    async function expelMember(memberId){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/${organizationId}/member`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${localStorage.getItem("access-token")}`,
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    memberId: memberId
                })
            });
            if(!request.ok){
                alert("Something failed while removing user");
                return;
            }
            alert("User expelled");
            await loadOrgInfo();

        } catch(error){
            alert(error.message)
        }
    }

    

    async function loadJoinRequests(){
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/memberships/joinrequests?organizationId=${organizationId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            const joinrequests = await request.json();
            setJoinRequests(joinrequests);
        } catch(error){
            alert(error);
        }
    }

    async function deleteOrganization(){
        const confirmed = confirm("Are you sure you want to delete this quiz?");
        if(!confirmed){
            return;
        }
        try{
            await checkAuth(navigate);
            const request = await fetch(`https://localhost:7015/api/organizations/${organizationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(!request.ok){
                alert("Something failed when deleting this organization");
                return;
            }
            alert("Deleted!")
            navigate("/home")
        } catch(error){
            alert(error.message)
        }
    }

    useEffect( () => {
        loadOrgInfo();
        loadOrgQuizzes();
    }, [organizationId])

    useEffect( () => {
        if(organizationRole === "Admin"){
            loadJoinRequests();
        }
    }, [organizationRole])

    return (
        <div>
            <CommonNavbar/>

            <Sidebar/>

            <div id="main-box">
                <h1>{organizationName}</h1>

                {organizationRole == "Admin" && <p style={{color: "rgb(140, 30, 30)"}} className="clickable-link" onClick={() => deleteOrganization()}>DELETE ORGANIZATION</p>}
                {organizationRole && organizationRole !== "Student" && (
                <>
                    <i>{organizationRole.charAt(0).toUpperCase() + organizationRole.slice(1)} View</i><br/><br/>
                    <div className="gray-box">
                        <b>Join Code: {organizationJoinCode} </b>
                    </div><br/><br/>
                        
                    {organizationRole == "Admin" && <h3>Pending Join Requests</h3>}
                    {organizationRole == "Admin" &&
                        <div className="members-list">
                            {joinRequests.length == 0 && <i>No Join Requests</i>}
                            {joinRequests && joinRequests.map( (j) => (
                                <div className="members-box">
                                    <p>{j.name} ({j.email})</p>
                                    <div>
                                        <button className="blue-btn" onClick={() => allowRequest(j.id, "Student")}>Student</button>
                                        <button className="orange-btn" onClick={() => allowRequest(j.id, "Instructor")}>Instructor</button>
                                        <button className="red-btn" onClick={() => denyRequest(j.id)}>Deny</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                
                    {organizationRole !== "Student" && <h3>Current members</h3> }
                    {organizationRole != "Student" &&
                        <div className="members-list">
                            {organizationMembers && organizationMembers.map((m) => (
                                <div className="members-box">
                                    <p>{m.name} ({m.email})</p>
                                    <div>
                                        <i>{m.role}</i>
                                        {organizationRole === "Admin" &&
                                        <button style={{marginLeft: "1rem" }} className="red-btn" onClick={() => expelMember(m.id)}>Expel</button>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    <h3>Organization Quizzes</h3>

                    {organizationRole === "Instructor" &&
                        <Link to={`/generate?organizationId=${organizationId}`}><button className="blue-btn">Generate a Quiz for {organizationName} </button></Link>
                    }
                    <br/>
                    
                </>
                )}

                <Link to={`/home?organizationId=${organizationId}`}><p className="clickable-link" style={{color:"#000", margin: "1rem 0"}}>GO TO QUIZZES</p></Link>
                    
                <ul className='box-container'>
                    {orgQuizzes.length == 0 && <i>No Quizzes</i>}
                    {orgQuizzes && orgQuizzes.map( (q) => (
                        <QuizBox info={q}/>
                    ))}
                </ul>


            </div>
        </div>
    )
}

export default Organization