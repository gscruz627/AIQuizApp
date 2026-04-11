import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

function Sidebar({profile}) {

    const [organizations, setOrganizations] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    async function loadMyOrganizations(){
        try{
            const request = await fetch(`https://localhost:7015/api/organizations/info?userId=${localStorage.getItem("userid")}`, {
                method: "GET",
                headers: {
                    "Authorization" :  `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(request.ok){
                const response = await request.json();
                setOrganizations(response)
            }

        } catch(error){
            alert(error.message);
        }
    }
    useEffect(() => {
        loadMyOrganizations();
    }, [])

    return (            
    <div className={profile && "decrease-size"} id="sidebar">
        <div className="show-if-small">
        <button className="sidebar-open-button inverse-button" onClick={() => setIsOpen(!isOpen)}>&#8667;</button>
        {isOpen &&
            <>
            <Link to="/generate"><button className="orange-btn">Generate Quiz</button></Link>
            <ul>
                <Link to="/home?saved=true"><li>Saved Quizzes</li></Link>
                <Link to="/home?my=true"><li>My Quizzes</li></Link>
                <Link to="/home?taken=true"><li>Taken Quizzes</li></Link>
            </ul>
            <ul>
            <Link to="/create-organization"><button className='orange-btn'>Create Organization</button></Link>
            <Link to="/join"><button className="blue-btn">Join Organization</button></Link>
            {organizations && organizations.map( (organization) => (
                <Link to={`/organization?organizationId=${organization.id}`}><li>{organization.name}</li></Link>
            ))}
            </ul>
            </>
        }
        </div>
        
        <div className="show-if-large">
            <Link to="/generate"><button className="orange-btn">Generate Quiz</button></Link>
            <ul>
                <Link to="/home?saved=true"><li>Saved Quizzes</li></Link>
                <Link to="/home?my=true"><li>My Quizzes</li></Link>
                <Link to="/home?taken=true"><li>Taken Quizzes</li></Link>
            </ul>
            <ul>
            <Link to="/create-organization"><button className='orange-btn'>Create Organization</button></Link>
            <Link to="/join"><button className="blue-btn">Join Organization</button></Link>
            {organizations && organizations.map( (organization) => (
                <Link to={`/organization?organizationId=${organization.id}`}><li>{organization.name}</li></Link>
            ))}
            </ul>
        </div>
    </div>  
    )
}

export default Sidebar