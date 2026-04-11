import { logout } from "../functions"
import { Link } from "react-router-dom"
import { useState } from "react";

function CommonNavbar({auth}) {
    const token = localStorage.getItem("access-token");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return (
        <nav className={auth ? "landing-nav navbar-on-auth" : "landing-nav"}>
            <Link to="/home"><h3><img src="logo.png" width="30"/>AI Quiz App</h3></Link>
            <div className="nav-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                &#9776;
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
            <div className="nav-inner-group">
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
            </div>
        </nav>
    )
}

export default CommonNavbar