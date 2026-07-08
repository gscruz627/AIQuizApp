import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Sidebar({ profile }) {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const [organizations, setOrganizations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [failureMsg, setFailureMsg] = useState("");

  async function loadMyOrganizations() {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/organizations/info?userId=${localStorage.getItem("userid")}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (request.ok) {
        const response = await request.json();
        setOrganizations(response);
      }
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }
  useEffect(() => {
    loadMyOrganizations();
  }, []);

  return (
    <div className={profile && "decrease-size"} id="sidebar">
      {failureMsg != "" && (
        <div className="alert-box red-box">
          <span>{failureMsg}</span>
          <button className="alert-close" onClick={() => setFailureMsg("")}>
            ✕
          </button>
        </div>
      )}
      <div className="show-if-small">
        <button
          className="sidebar-open-button inverse-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="fa-solid fa-grip"></i>
        </button>
        {isOpen && (
          <>
            <ul>
              <Link to="/generate">
                <li>
                  <i className="fa-solid fa-circle-plus"></i> &nbsp; GENERATE
                  QUIZ
                </li>
              </Link>
              <Link to="/home?saved=true">
                <li>
                  <i className="fa-regular fa-bookmark"> &nbsp;</i>SAVED QUIZZES
                </li>
              </Link>
              <Link to="/home?my=true">
                <li>
                  <i className="fa-solid fa-house-user"></i> &nbsp; MY QUIZZES
                </li>
              </Link>
              <Link to="/home?taken=true">
                <li>
                  <i className="fa-regular fa-circle-check"></i> &nbsp; TAKEN
                  QUIZZES
                </li>
              </Link>
              <Link to="/create-organization">
                <li>
                  <i className="fa-solid fa-circle-plus"></i> &nbsp; CREATE
                  ORGZ.
                </li>
              </Link>
              <Link to="/join">
                <li>
                  <i className="fa-solid fa-link"></i> &nbsp; JOIN ORGZ.
                </li>
              </Link>
              {organizations &&
                organizations.map((organization) => (
                  <Link
                    to={`/organization?organizationId=${organization.id}`}
                    key={organization.id}
                  >
                    <li>{organization.name}</li>
                  </Link>
                ))}
            </ul>
          </>
        )}
      </div>

      <div className="show-if-large">
        <ul>
          <Link to="/generate">
            <li>
              <i className="fa-solid fa-circle-plus"></i> &nbsp; GENERATE QUIZ
            </li>
          </Link>
          <Link to="/home?saved=true">
            <li>
              <i className="fa-regular fa-bookmark"> &nbsp;</i>SAVED QUIZZES
            </li>
          </Link>
          <Link to="/home?my=true">
            <li>
              <i className="fa-solid fa-house-user"></i> &nbsp; MY QUIZZES
            </li>
          </Link>
          <Link to="/home?taken=true">
            <li>
              <i className="fa-regular fa-circle-check"></i> &nbsp; TAKEN
              QUIZZES
            </li>
          </Link>
          <Link to="/create-organization">
            <li>
              <i className="fa-solid fa-circle-plus"></i> &nbsp; CREATE ORGZ.
            </li>
          </Link>
          <Link to="/join">
            <li>
              <i className="fa-solid fa-link"></i> &nbsp; JOIN ORGZ.
            </li>
          </Link>
          {organizations &&
            organizations.map((organization) => (
              <Link
                to={`/organization?organizationId=${organization.id}`}
                key={organization.id}
              >
                <li>{organization.name}</li>
              </Link>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
