import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect } from "react";
import { checkAuth } from "../functions";
import CommonNavbar from "../components/CommonNavbar";

function JoinOrganization() {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [failureMsg, setFailureMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function join(e) {
    e.preventDefault();
    try {
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/memberships/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          joinCode,
        }),
      });
      if (!request.ok) {
        const errorMessage = await request.text();
        setFailureMsg(errorMessage);
        return;
      }
      const info = await request.json();
      setSuccessMsg("Join requested!");
      setPendingRequests((prev) => [...prev, info]);
    } catch (error) {
      setFailureMsg("There was an error on the server side: " + error.message);
    }
  }

  async function cancelJoinRequest(joinrequestid) {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/memberships/resolution/${joinrequestid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "Cancel",
          }),
        },
      );
      if (request.ok) {
        setSuccessMsg("Request has been canceled");
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== joinrequestid),
        );
      } else {
        const failureText = await request.text();
        setFailureMsg("Something went wrong while canceling: " + failureText);
      }
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function loadPendingRequests() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/memberships/joinrequests?userId=${localStorage.getItem("userid")}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const info = await request.json();
      setPendingRequests(info);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  useEffect(() => {
    loadPendingRequests();
  }, []);
  return (
    <div>
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
          <div className="center-box">
            <form onSubmit={(e) => join(e)}>
              <div className="center-box-title">
                <h4>Join Organization</h4>
              </div>
              <div>
                <label htmlFor="code">Join Code: </label>
                <input
                  className="generate-quiz-numberQuestions"
                  id="code"
                  placeholder="ie. 123456"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <br />
                <button type="submit" className="primary-btn">
                  Join
                </button>
              </div>
            </form>
          </div>

          <br />

          <h3 className="primary-color">PENDING JOIN REQUESTS</h3>
          <div className="main-inner-box">
            <ul>
              {pendingRequests &&
                pendingRequests.map((p) => (
                  <div className="quizbox-item" key={p.id}>
                    <h4>{p.orgName}</h4>
                    <button
                      className="cancel-btn"
                      onClick={() => cancelJoinRequest(p.id)}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinOrganization;
