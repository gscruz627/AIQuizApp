import { useState, useEffect } from "react";
import QuizBox from "../components/QuizBox";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout, checkAuth } from "../functions";


function HomeView() {
    const [searchParams] = useSearchParams();
    const organizationId = searchParams.get("organizationId");
    const saved = searchParams.get("saved");
    const my = searchParams.get("my");
    const taken = searchParams.get("taken");

    const SERVER_URL = import.meta.env.VITE_URL;

    const token = localStorage.getItem("access-token");
    const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();


    async function loadQuizes(){
        try{
            await checkAuth(navigate);
            let route;
            if(organizationId){
                route = `${SERVER_URL}/api/quizes?organizationId=${organizationId}`
            } else if (saved){
                route = `${SERVER_URL}/api/quizes?saved=true`
            } else if (my){
                route = `${SERVER_URL}/api/quizes?my=true`
            } else if (taken){
                route = `${SERVER_URL}/api/quizes?taken=true`
            } else {
                route = `${SERVER_URL}/api/quizes`
            }
            const request = await fetch(route, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access-token")}`
                }
            });
            if(!request.ok){
                alert("Failed to load quizes.");
                return;
            }
            const response = await request.json();
            setFeaturedQuizzes(response);
            setFilteredQuizzes(response);

        } catch(error){
            alert(error);
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        if (searchTerm !== "") {
            const filtered = featuredQuizzes.filter(q =>
                q.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredQuizzes(filtered);
        } else {
            setFilteredQuizzes(featuredQuizzes);
        }
    }


    useEffect(() => {
        loadQuizes();
    }, [saved, my, organizationId])

    return (
        <div>
            <nav className="landing-nav">
                <Link to="/home"><h3><img src="logo.png" width="30"/>AI Quiz App</h3></Link>
                <div className="nav-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    E
                </div>
                {isDropdownOpen && <div className="nav-inner-group nav-inner-group-mobile">
                {token ? 
                <>
                    <span><Link to="/profile">Profile</Link></span>
                    <button className="orange-btn" onClick={() => logout()}>Log Out</button>
                </>
                :
                <>
                    <Link to="/login"><button className="orange-btn">Log In</button></Link>
                    <Link to="/register"><button className="blue-btn">Register</button></Link>
                </>
                }
                </div>}
                <form onSubmit={(e) => handleSearch(e)}>
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder='Search...'></input>
                </form>
                <div className="nav-inner-group">
                    {token ? 
                    <>
                    <Link to="/profile">Profile</Link>
                    <button className="orange-btn" onClick={() => logout()}>Log Out</button>
                    </>
                    :
                    <>
                    <Link to="/login"><button className="orange-btn">Log In</button></Link>
                    <Link to="/register"><button className="blue-btn">Register</button></Link>
                    </>
                    }
                </div>
            </nav>

            <Sidebar/>

            <div id="main-box">
                <h1>{my && "My Quizzes"} {saved && "Saved Quizzes"} {taken && "Quizzes you took"} {!my && !saved && !taken && "Quizzes"}</h1>
                <ul className="box-container">
                    {filteredQuizzes && filteredQuizzes.map( (quiz) => (
                        <QuizBox info={quiz}/>
                    ))}
                </ul>
            </div>

        </div>
    )
}

export default HomeView