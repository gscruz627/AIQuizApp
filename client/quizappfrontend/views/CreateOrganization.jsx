import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CommonNavbar from "../components/CommonNavbar";
import { checkAuth } from "../functions";

function CreateOrganization() {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const navigate = useNavigate();
  const [orgTitle, setOrgTitle] = useState("");
  const [failureMsg, setFailureMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function createOrganization(e) {
    e.preventDefault();
    try {
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: orgTitle,
        }),
      });
      if (!request.ok) {
        const message = await request.text();
        setFailureMsg(message);
      } else {
        const resultOrganization = await request.json();
        setSuccessMsg("Organization created successfully! Redirecting....");
        setTimeout(() => {
          navigate(`/organization?organizationId=${resultOrganization.id}`);
        }, 3000);
      }
    } catch (error) {
      setFailureMsg("There was an error in the server: " + error.message);
    }
  }

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
            <form onSubmit={(e) => createOrganization(e)}>
              <div className="center-box-title">
                <h4>Create Organization</h4>
              </div>
              <br />
              <div>
                <label htmlFor="orgName">Name: </label>
                <input
                  className="generate-quiz-numberQuestions"
                  value={orgTitle}
                  onChange={(e) => setOrgTitle(e.target.value)}
                  id="orgName"
                  type="text"
                ></input>
                <br />
                <button type="submit" className="primary-btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrganization;
