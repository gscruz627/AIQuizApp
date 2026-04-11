import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingView from "../views/LandingView"
import HomeView from "../views/HomeView"
import Register from "../views/Register"
import Login from "../views/Login"
import QuizView from "../views/QuizView"
import GenerateQuiz from "../views/GenerateQuiz"
import CreateOrganization from "../views/CreateOrganization"
import Organization from "../views/Organization"
import JoinOrganization from "../views/JoinOrganization"
import ProfileView from "../views/ProfileView"
import 'katex/dist/katex.min.css';
import renderMathInElement from "katex/contrib/auto-render";
import { useEffect } from "react"
import { useMathWatcher } from "../functions"

function App() {
  useMathWatcher();
  useEffect(() => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ]
  });
}, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/home" element={<HomeView />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/quiz" element={<QuizView/>}/>
        <Route path="/generate" element={<GenerateQuiz/>}/>
        <Route path="/create-organization" element={<CreateOrganization/>}/>
        <Route path="/organization" element={<Organization/>}/>
        <Route path="/join" element={<JoinOrganization/>}/>
        <Route path="/profile" element={<ProfileView/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
