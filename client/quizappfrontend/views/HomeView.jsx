import { useState, useEffect } from "react";
import QuizBox from "../components/QuizBox";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { logout, checkAuth } from "../functions";

function HomeView() {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const saved = searchParams.get("saved");
  const my = searchParams.get("my");
  const taken = searchParams.get("taken");

  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [failureMsg, setFailureMsg] = useState("");
  const navigate = useNavigate();

  async function loadQuizes() {
    try {
      await checkAuth(navigate);
      let route;
      if (organizationId) {
        route = `${SERVER_URL}/api/quizes?organizationId=${organizationId}`;
      } else if (saved) {
        route = `${SERVER_URL}/api/quizes?saved=true`;
      } else if (my) {
        route = `${SERVER_URL}/api/quizes?my=true`;
      } else if (taken) {
        route = `${SERVER_URL}/api/quizes?taken=true`;
      } else {
        route = `${SERVER_URL}/api/quizes`;
      }
      const request = await fetch(route, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!request.ok) {
        const message = await request.text();
        setFailureMsg("Error from the server: " + message);
        return;
      }
      const response = await request.json();
      setFeaturedQuizzes(response);
      setFilteredQuizzes(response);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchTerm !== "") {
      const filtered = featuredQuizzes.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(featuredQuizzes);
    }
  }

  useEffect(() => {
    loadQuizes();
  }, [saved, my, organizationId]);

  return (
    <div>
      <nav className="landing-nav">
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
                  <Link to="/profile" className="primary-color">
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
        <form onSubmit={(e) => handleSearch(e)}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search..."
          ></input>
        </form>
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
                <button className="orange-btn">Log In</button>
              </Link>
              <Link to="/register">
                <button className="blue-btn">Register</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {successMsg != "" && (
        <div className="alert-box green-box consider-sidebar">
          <span>{successMsg}</span>
          <button className="alert-close" onClick={() => setSuccessMsg("")}>
            ✕
          </button>
        </div>
      )}

      {failureMsg != "" && (
        <div className="alert-box red-box consider-sidebar">
          <span>{failureMsg}</span>
          <button className="alert-close" onClick={() => setFailureMsg("")}>
            ✕
          </button>
        </div>
      )}

      <div className="content-sider">
        <Sidebar />

        <div className="main-box">
          <div className="main-inner-box">
            <h3>
              {my && "MY QUIZZES"} {saved && "SAVED QUIZZES"}{" "}
              {taken && "QUIZZES YOU TOOK"}{" "}
              {!my && !saved && !taken && "QUIZZES"}
            </h3>
            <ul>
              {filteredQuizzes.length == 0 && (
                <p style={{ padding: "0.75rem 1rem" }}>
                  No Quizzes here yet...
                </p>
              )}
              {filteredQuizzes &&
                filteredQuizzes.length > 0 &&
                filteredQuizzes.map((quiz) => (
                  <QuizBox info={quiz} key={quiz.id} />
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;
