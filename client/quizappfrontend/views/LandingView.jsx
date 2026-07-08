import { logout } from "../functions";
import "../src/App.css";
import { Link } from "react-router-dom";
function LandingView() {
  const token = localStorage.getItem("access-token");
  return (
    <div>
      <nav className="landing-nav">
        <h3 className="primary-color">AI Quiz App</h3>
        {token ? (
          <div>
            <Link to="/home">
              <button className="primary-btn">ACCESS QUIZZES</button>
            </Link>
            <button className="secondary-btn" onClick={() => logout()}>
              LOG OUT
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login">
              <button onClick={() => {}} className="primary-btn">
                Log In
              </button>
            </Link>
            <Link to="/register">
              <button onClick={() => {}} className="secondary-btn">
                Register
              </button>
            </Link>
          </div>
        )}
      </nav>

      <div className="spaced-div" id="landing-div">
        <h1 className="primary-color">TEST YOUR KNOWLEDGE</h1>
        <br />
        <p className="gray-color">Fun and Engaging Quizzes for everyone</p>
        <br />

        <Link to="/register">
          <button className="primary-btn">REGISTER HERE</button>
        </Link>
      </div>
      <div className="spaced-div">
        <div className="landing-card-container">
          <div className="landing-card">
            <img src="landing-1.png"></img>
            <div>
              <h4 className="primary-color">Challenge Yourself</h4>
              <p>Test your knowledge with a variety of quizzes and topics</p>
            </div>
          </div>

          <div className="landing-card">
            <img src="landing-2.png"></img>
            <div>
              <h4 className="primary-color">Compete with your Team</h4>
              <p>
                Create or join an organization and take or make quizzes for your
                team
              </p>
            </div>
          </div>

          <div className="landing-card">
            <img src="landing-3.png"></img>
            <div>
              <h4 className="primary-color">Learn and Have Fun</h4>
              <p>Discover fun facts and improve your skills</p>
            </div>
          </div>
        </div>
      </div>

      <div className="spaced-div">
        <h3 className="primary-color">Create or Join a Team</h3>

        <p className="gray-color">
          With AI Quiz App you can create and/or join an organization to create
          and take quizzes within your team, users are divided into the
          'instructor' and 'student' roles.
        </p>
      </div>

      <footer>
        Created by Gustavo, Assad, Saurav. 2026. Refined by Gustavo (gscruz627)
        2026.
      </footer>
    </div>
  );
}

export default LandingView;
