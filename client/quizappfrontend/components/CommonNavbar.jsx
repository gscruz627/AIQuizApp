import { logout } from "../functions";
import { Link } from "react-router-dom";
import { useState } from "react";

function CommonNavbar({ auth }) {
  const token = localStorage.getItem("access-token");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <nav className={auth ? "landing-nav navbar-on-auth" : "landing-nav"}>
      <Link to="/home">
        <h3 className="primary-color">AI Quiz App</h3>
      </Link>
      <div
        className="nav-dropdown"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <i
          style={{ fontSize: "24px" }}
          className="primary-color fa-solid fa-bars"
        ></i>
      </div>
      {isDropdownOpen && (
        <div className="nav-inner-group nav-inner-group-mobile">
          {token ? (
            <>
              <span>
                <Link to="/profile" className="primary-color bold-text">
                  Profile
                </Link>
              </span>
              <button className="primary-btn" onClick={() => logout()}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="primary-btn">Log In</button>
              </Link>
              <Link to="/register">
                <button className="secondary-btn">Register</button>
              </Link>
            </>
          )}
        </div>
      )}
      <div className="nav-inner-group">
        {token ? (
          <>
            <span>
              <Link to="/profile" className="primary-color bold-text">
                Profile
              </Link>
            </span>
            <button className="primary-btn" onClick={() => logout()}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="primary-btn">Log In</button>
            </Link>
            <Link to="/register">
              <button className="secondary-btn">Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default CommonNavbar;
