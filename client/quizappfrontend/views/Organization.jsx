import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { checkAuth } from "../functions";
import QuizBox from "../components/QuizBox";
import CommonNavbar from "../components/CommonNavbar";

function Organization() {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationRole, setOrganizationRole] = useState("");
  const [organizationJoinCode, setOrganizationJoinCode] = useState("");
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [orgQuizzes, setOrgQuizzes] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [failureMsg, setFailureMsg] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);

  async function allowRequest(joinRequestId, role) {
    try {
      await checkAuth(navigate);
      const results = await fetch(
        `${SERVER_URL}/api/memberships/resolution/${joinRequestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "Allow",
            role,
          }),
        },
      );
      const newMember = await results.json();
      setSuccessMsg("Request has been accepted.");
      setOrganizationMembers((prev) => [...prev, newMember]);
      setJoinRequests((prev) =>
        prev.filter((request) => request.id !== joinRequestId),
      );
    } catch (error) {
      setFailureMsg("There was an error with the server: " + error.message);
    }
  }

  async function denyRequest(joinRequestId) {
    try {
      await checkAuth(navigate);
      await fetch(`${SERVER_URL}/api/memberships/resolution/${joinRequestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "Deny",
        }),
      });
      setJoinRequests((prev) =>
        prev.filter((request) => request.id !== joinRequestId),
      );
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function loadOrgInfo() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const response = await request.json();
      setOrganizationName(response.name);
      setOrganizationRole(response.role);
      setOrganizationMembers(response.members);
      setOrganizationJoinCode(response.joinCode);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function loadOrgQuizzes() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/quizes?organizationId=${organizationId}&limit=5`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!request.ok) {
        const message = await request.text();
        setFailureMsg("There was an error from the server: " + message);
        return;
      }
      const quizes = await request.json();
      setOrgQuizzes(quizes);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function expelMember(memberId) {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/memberships/${organizationId}/member`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: memberId,
          }),
        },
      );
      if (!request.ok) {
        const message = await request.text();
        setFailureMsg("There was an error while removing the user: " + message);
        return;
      }
      setSuccessMsg("User was successfully expelled.");
      setJoinRequests((prev) =>
        prev.filter((request) => request.id !== memberId),
      );
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function loadJoinRequests() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/memberships/joinrequests?organizationId=${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const joinrequests = await request.json();
      setJoinRequests(joinrequests);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function deleteOrganization() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/organizations/${organizationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!request.ok) {
        const message = await request.text();
        setFailureMsg(
          "There was an error while deleting this organization: " + message,
        );
        return;
      }
      setSuccessMsg("Succesfully deleted the organization... redirecting...");
      setTimeout(() => {
        navigate("/home");
      }, 3000);
    } catch (error) {
      setFailureMsg("There was an error on the setting: " + error.message);
    }
  }

  useEffect(() => {
    loadOrgInfo();
    loadOrgQuizzes();
  }, [organizationId]);

  useEffect(() => {
    if (organizationRole === "Admin") {
      loadJoinRequests();
    }
  }, [organizationRole]);

  return (
    <div>
      {openConfirm && (
        <div className="confirm-box-outer">
          <div className="center-box">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="center-box-title">
                <h4>Confirm</h4>
              </div>
              <div>
                <p>Are you sure you want to delete the organization? </p>
                <button
                  type="button"
                  className="cancel-btn"
                  style={{ display: "inline" }}
                  onClick={() => deleteOrganization()}
                >
                  YES
                </button>{" "}
                &nbsp;
                <button
                  type="button"
                  className="primary-btn"
                  style={{ display: "inline" }}
                  onClick={() => setOpenConfirm(false)}
                >
                  NO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CommonNavbar />

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
          <div className="spaced-between">
            <span>
              <h2 className="primary-color" style={{ display: "inline" }}>
                {organizationName} &nbsp;
              </h2>
              {organizationRole == "Admin" && (
                <span className="btn purple-btn">
                  <i className="fa-solid fa-users-gear"></i> ADMIN
                </span>
              )}
              {organizationRole == "Instructor" && (
                <span className="btn blue-btn">
                  <i className="fa-solid fa-chalkboard-user"></i> INSTRUCTOR
                </span>
              )}
            </span>
            {organizationRole == "Admin" && (
              <button
                className="cancel-btn"
                onClick={() => setOpenConfirm(true)}
              >
                DELETE
              </button>
            )}
          </div>

          {organizationRole && organizationRole !== "Student" && (
            <>
              <div className="join-code-box">
                <p className="gray-color">Join:</p>
                <h1>{organizationJoinCode}</h1>
              </div>

              {organizationRole == "Admin" && (
                <div className="main-inner-box">
                  <h3 className="primary-color">Pending Join Requests</h3>
                  <ul>
                    {joinRequests.length == 0 && (
                      <div className="quizbox-item">
                        <h4> No Join requests</h4>
                      </div>
                    )}

                    {joinRequests &&
                      joinRequests.map((j) => (
                        <div className="quizbox-item" key={j.id}>
                          <h4>
                            {j.name} ({j.email})
                          </h4>
                          <div>
                            <button
                              className="blue-btn"
                              onClick={() => allowRequest(j.id, "Student")}
                            >
                              Student
                            </button>{" "}
                            &nbsp;
                            <button
                              className="blue-btn"
                              onClick={() => allowRequest(j.id, "Instructor")}
                            >
                              Instructor
                            </button>{" "}
                            &nbsp;
                            <button
                              className="cancel-btn"
                              onClick={() => denyRequest(j.id)}
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))}
                  </ul>
                </div>
              )}

              <br />

              {organizationRole != "Student" && (
                <div className="main-inner-box">
                  <h3 className="primary-color">Current members</h3>
                  {organizationMembers &&
                    organizationMembers.map((m) => (
                      <div className="quizbox-item" key={m.id}>
                        <h4>
                          {m.name} ({m.email})
                        </h4>
                        <div>
                          <i>{m.role}</i>
                          {organizationRole === "Admin" &&
                            m.id != localStorage.getItem("userid") && (
                              <button
                                style={{ marginLeft: "1rem" }}
                                className="cancel-btn"
                                onClick={() => expelMember(m.id)}
                              >
                                EXPEL
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
          <br />

          {/* Buttons */}
          <div>
            {organizationRole === "Instructor" && (
              <Link to={`/generate?organizationId=${organizationId}`}>
                <button className="blue-btn">GENERATE</button>
              </Link>
            )}{" "}
            &nbsp;
            <Link to={`/home?organizationId=${organizationId}`}>
              <button className="primary-btn">SEE QUIZZES</button>
            </Link>
          </div>

          <br />
          <div className="main-inner-box">
            <h3>QUIZZES</h3>
            <ul>
              {orgQuizzes.length == 0 && (
                <div className="quizbox-item">
                  <h4>No Quizzes</h4>
                </div>
              )}
              {orgQuizzes &&
                orgQuizzes.map((q) => <QuizBox info={q} key={q.id} />)}
            </ul>
          </div>
          <ul className="box-container"></ul>
        </div>
      </div>
    </div>
  );
}

export default Organization;
