import { logout, } from "../functions";
import "../src/App.css"
import { Link } from "react-router-dom"
function LandingView() {
    const token = localStorage.getItem("access-token");
    return (
        <div>
            <nav className="landing-nav">
                <h3>AI Quiz App</h3>
                {token ? 
                    <div>
                        <button className="orange-btn">Access Quizzes</button>
                        <button className="blue-btn" onClick={() => logout()}>Log Out</button>
                    </div>
                :
                    <div>
                        <Link to="/login"><button onClick={() => {}} className="orange-btn">Log In</button></Link>
                        <Link to="/register"><button onClick={() => {}} className="blue-btn">Register</button></Link>
                    </div>
                }
            </nav>

            <div className="spaced-div" id="landing-div">
                <h1 style={{fontSize: "48px"}}>Test Your Knowledge!</h1>
                <br/>
                <p>Fun and Engaging Quizzes for everyone</p>
                <br/>

                <Link to="/register"><button className="orange-btn">Register Here</button></Link>
            </div>
            <div className="spaced-div slight-blue">
                <div className="landing-card-container">

                    <div className="landing-card">
                        <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngplay.com%2Fwp-content%2Fuploads%2F7%2FChecklist-PNG-Photos.png&f=1&nofb=1&ipt=30a06e193a44e59cd55bc4dcc31c1b7eef4a952c6f98e1141ed3a33df3fcddbd"></img>
                        <div>
                            <h4>Challenge Yourself</h4>
                            <p>Test your knowledge with a variety of quizzes and topics</p>
                        </div>
                    </div>

                    <div className="landing-card">
                        <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn0.iconfinder.com%2Fdata%2Ficons%2Fstartup-and-new-business-3%2F24%2Fdeveloper-team-512.png&f=1&nofb=1&ipt=fdeec7491bcb6a6b449c2808159d0e8f6f2853c1b867fc0bc9eb8630b9e19536"></img>
                        <div>
                            <h4>Compete with your Team</h4>
                            <p>Create or join an organization and take or make quizzes for your team</p>
                        </div>
                    </div>

                    <div className="landing-card">
                        <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.adazing.com%2Fwp-content%2Fuploads%2F2019%2F02%2Fstacked-book-clipart-02.png&f=1&nofb=1&ipt=4c1ed148c1a127f4ee0660523f2e38493d86f32fc068937667331928b0688f00"></img>
                        <div>
                            <h4>Learn and Have Fun</h4>
                            <p>Discover fun facts and improve your skills</p>
                        </div>
                    </div>

                </div>

            </div>

            <div className="spaced-div">
                    <h3>Create or Join a Team</h3>

                    <p>With AI Quiz App you can create and/or join an organization
                        to create and take quizzes within your team, users are divided
                        into the 'instructor' and 'student' roles.
                    </p>

                    <img src="" style={{width: "45%"}}></img>


            </div>

            <footer>
                Created by Gustavo, Assad, Saurav. 2026
            </footer>
        </div>
    )
}

export default LandingView