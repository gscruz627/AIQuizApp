import { useSearchParams, Link, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { logout, checkAuth } from "../functions";
import QuizQuestion from "../components/QuizQuestion";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import CommonNavbar from "../components/CommonNavbar";

function QuizView() {

    const SERVER_URL = import.meta.env.VITE_URL;

    const token = localStorage.getItem("access-token");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [quiz, setQuiz] = useState({});
    const [saved, setSaved] = useState(false);
    const [takingQuiz, setTakingQuiz] = useState(false);
    const [prevAttempts, setPrevAttempts] = useState([]);
    const [seeQuestions, setSeeQuestions] = useState(false);
    const [organizationMembership, setOrganizationMembership] = useState({});
    const [organizationStudentPreviousAttempts, setOrganizationStudentPreviousAttempt] = useState([]);
    const [organizationMyAttempts, setOrganizationMyAttempts] = useState([]);
    const [progress, setProgress] = useState({});
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizDone, setQuizDone] = useState(false);
    const quizId = searchParams.get("quizId");

    function escapeXML(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

    function exportToCSV() {
      if (!quiz?.questions) return;

      const rows = [
        ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer"]
      ];

      quiz.questions.forEach((q, i) => {
        const answers = quiz.answers[i];
        const correct = answers[quiz.correctAnswerIndices[i]];

        rows.push([q, ...answers, correct]);
      });

      const csvContent = rows
        .map(row => row.map(val => `"${val}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${quiz.title}.csv`);
    }
    function exportToPDF() {
      if (!quiz?.questions) return;

      const doc = new jsPDF();

      let y = 10;

      doc.setFontSize(16);
      doc.text(quiz.title, 10, y);
      y += 10;

      doc.setFontSize(12);

      quiz.questions.forEach((q, i) => {
        if (y > 270) {
          doc.addPage();
          y = 10;
        }

        doc.text(`${i + 1}. ${q}`, 10, y);
        y += 6;

        quiz.answers[i].forEach((ans, idx) => {
          doc.text(`${String.fromCharCode(65 + idx)}. ${ans}`, 15, y);
          y += 6;
        });

        y += 4;
      });

      doc.save(`${quiz.title}.pdf`);
    }
    async function exportToQTI() {
      if (!quiz?.questions) return;

      const zip = new JSZip();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <questestinterop>
      <assessment title="${quiz.title}">
        <section>
      `;

     quiz.questions.forEach((q, i) => {
  xml += `
    <item ident="q${i}" title="Question ${i + 1}">
      <presentation>
        <material>
          <mattext texttype="text/html">${escapeXML(q)}</mattext>
        </material>
        <response_lid ident="response${i}" rcardinality="Single">
          <render_choice>
  `;

  quiz.answers[i].forEach((ans, idx) => {
    xml += `
      <response_label ident="A${idx}">
        <material>
          <mattext texttype="text/html">${escapeXML(ans)}</mattext>
        </material>
      </response_label>
    `;
  });

  xml += `
          </render_choice>
        </response_lid>
      </presentation>

      <resprocessing>
        <outcomes>
          <decvar varname="SCORE" vartype="Decimal" minvalue="0" maxvalue="100"/>
        </outcomes>
        <respcondition continue="No">
          <conditionvar>
            <varequal respident="response${i}">A${quiz.correctAnswerIndices[i]}</varequal>
          </conditionvar>
          <setvar varname="SCORE" action="Set">100</setvar>
        </respcondition>
      </resprocessing>
    </item>
  `;
});

      xml += `
        </section>
      </assessment>
    </questestinterop>
      `;

      // Required imsmanifest.xml for LMS import
      const manifest = `<?xml version="1.0" encoding="UTF-8"?>
    <manifest identifier="quiz_manifest" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
      <resources>
        <resource identifier="quiz" type="imsqti_xmlv1p2" href="quiz.xml">
          <file href="quiz.xml"/>
        </resource>
      </resources>
    </manifest>
    `;

      zip.file("quiz.xml", xml);
      zip.file("imsmanifest.xml", manifest);

      const content = await zip.generateAsync({ type: "blob" });

      saveAs(content, `${quiz.title}-qti.zip`);
    }
    async function loadQuiz(){
      try{
        await checkAuth(navigate);
        const request = await fetch(`${SERVER_URL}/api/quizes/${quizId}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const response = await request.json();
        if(response.organizationId){
          const orgRequest = await fetch(`${SERVER_URL}/api/organizations/${response.organizationId}`, {
            method: "GET",
            headers: {
              "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            }
          });
          if(!orgRequest.ok){
            alert("something failed");
            return;
          }
          const orgResponse = await orgRequest.json();
          setOrganizationMembership(orgResponse);
          if(orgResponse.role == "Instructor"){
            const studentAttemptsRequest = await fetch(`${SERVER_URL}/api/quizes/${quizId}/student-attempts`, {
              method: "GET",
              headers: {
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
              }
            });
            if(!studentAttemptsRequest.ok){
              alert("something failed");
              return;
            }
            const studentAttemptsResponse = await studentAttemptsRequest.json();
            setOrganizationStudentPreviousAttempt(studentAttemptsResponse);
          }
        }
        function transformMath(str = "") {
  return str
    .replace(/\\\((.*?)\\\)/g, "$$$1$$")
    .replace(/\\\[(.*?)\\\]/g, "$$$$ $1 $$$$");
}

const transformed = {
  ...response,
  questions: response.questions.map(q => transformMath(q)),
  answers: response.answers.map(arr =>
    arr.map(a => transformMath(a))
  )
};

setQuiz(transformed);
        const savedResponse = await fetch(`${SERVER_URL}/api/quizes/saved/${quizId}/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const status = await savedResponse.json();
        setSaved(status.saved);
      } catch(error){
          alert(error.message);
      }
    }

    async function save(){
      try{
        await checkAuth(navigate);
        const response = await fetch(`${SERVER_URL}/api/quizes/save/${quizId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
            }
        });
        if(response.ok){
            setSaved(true);
        } else {
            alert("Failed to save quiz");
        }
      } catch(error){
          alert(error.message);
      }
    }

    async function unsave(){
      try{
        await checkAuth(navigate);
          const response = await fetch(`${SERVER_URL}/api/quizes/unsave/${quizId}`, {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
              }
          });
          if(response.ok){
              setSaved(false);
          } else {
              alert("Failed to unsave quiz");
          }
      } catch(error){
          alert(error.message);
      }
    }

    async function loadAttempts() {
      try{
        await checkAuth(navigate);
        const request = await fetch(`${SERVER_URL}/api/quizes/attempts/${quiz.id}`, {
          method: "GET",
          headers: {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
          }
        });
        const response = await request.json();
        setPrevAttempts(response);
      } catch(error){
        alert("Error loading attempts: " + error.message)
      }
    }

  async function deleteQuiz(){
    await checkAuth(navigate);
    const confirmed = confirm("Are you sure you want to delete this quiz?");
    if(!confirmed){
      return;
    }
      try{
          const response = await fetch(`${SERVER_URL}/api/quizes/${quizId}`, {
              method: "DELETE",
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem("access-token")}`
              }
          });
          if(response.ok){
              alert("Quiz deleted successfully");
              navigate("/home")
          } else {
              alert("Failed to delete quiz");
          }
      } catch(error){
          alert(error);
      }
  }



    function handleStopQuiz(){
      
      const confirmation = confirm("Are you sure? Stopping the quiz will delete any progress.")
      if (confirmation === true){
        setTakingQuiz(false);
      }
      return;
    }

    async function submitQuiz(){
      await checkAuth(navigate);
      if(quizDone){
        setTakingQuiz(false);
        return;
      }
      if(!quizDone){
        setQuizDone(true);
        try{
          const request = await fetch(`${SERVER_URL}/api/quizes/submit`, {
            method: "POST",
            headers: {
              "Content-Type" : "application/json",
              "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
              quizId: quiz.id,
              score: Math.round((Object.values(progress).filter(v => v === true).length / quiz.questions.length) * 100)
            })
          });
          if(!request.ok){
            alert("Error submitting your quiz.");
          }
        } catch(error){
          alert("Error submitting your quiz: " + error.message);
        }
        return; 
      }
    }

    function handleTakeQuizButton(){
      if(!quizDone){
        setTakingQuiz(true);
      }
      if(quizDone){
        setTakingQuiz(false);
      }
    }

    useEffect( () => {
      loadQuiz();
    }, [])

    useEffect( () => {
      if(quiz && quiz.id){
        loadAttempts();
      }
    }, [quiz])

    return (
      <div>
        <CommonNavbar/>

      <Sidebar/>

        <div id="main-box">
          <h1>{quiz && quiz.title}</h1>

          {quiz.authorId == localStorage.getItem("userid") && <p style={{color: "rgb(140, 30, 30)"}} className="clickable-link" onClick={() => deleteQuiz()}>DELETE QUIZ</p>}
          
          <br/>
          
          {takingQuiz ? 
          <button className="red-btn" onClick={() => handleStopQuiz()}>Stop Quiz</button>
          :
          <button className="orange-btn" onClick={() => setTakingQuiz(true)}>Take The Quiz</button>
          }         
          
          {takingQuiz ?
            <>
            <br/><h3 className="blue-text">Questions</h3><br/>
            <hr/>
            <button className="orange-btn" onClick={() => setQuizIndex(prev => prev - 1)} style={{marginRight:"1rem"}}>Previous</button>
            {quizIndex == quiz.questions.length - 1 ?
            <button className="blue-btn" onClick={() => submitQuiz()}>{quizDone ? "Go Back to the Quiz" : "Submit Quiz"}</button>
            :
            <button className="blue-btn" onClick={() => setQuizIndex(prev => prev + 1)}>Next</button>
            }
            <br/><br/>
            <div className="quiz-container">
            <div className="question-block">
            Score: {Object.values(progress).filter(v => v === true).length} / {quiz.questions.length} 
            </div>
            <br/>
            {quizDone && <><h4>Question Summary</h4><br/></>}
              {quiz&& quiz.questions && quiz.questions.map( (q, i) => (
                <QuizQuestion progress={progress} setProgress={setProgress} question={quiz.questions[i]} answers={quiz.answers[i]} correctIndex={quiz.correctAnswerIndices[i] } display={(i == quizIndex || quizDone) ? "block" : "none"} questionIndex={i}/>
              ))}
            </div>
            </>
            :
            <>
            <div id="export-organizer">
                <h4>Export As</h4>
                <ul>
                  <li onClick={() => exportToPDF()}>PDF</li>
                  <li onClick={() => exportToCSV()}>CSV</li>
                  <li onClick={() => exportToQTI()}>QTI (Canvas, Brightspace, etc)</li>
                </ul>
            </div>

            <br/>

            {saved ? 
              <button onClick={() => unsave()} className="red-btn">Unsave</button>
            :
              <button onClick={() => save()} className="blue-btn">Save</button>
            }
            <br/><br/>

            <h3 className="clickable-link" onClick={() => setSeeQuestions(!seeQuestions)}>{seeQuestions ? "Hide Questions" : "See Questions"}</h3>

            <br/>
            {seeQuestions && <><h4 style={{borderBottom: "1px solid rgb(232, 232, 232)"}}>Questions</h4><hr/></>}
            {seeQuestions && quiz && quiz.questions.map( (question, i) => (
              <div className="quiz-preview-ind">
                <p>{i+1}. {question}</p>
              </div>
            ))}
            <br/>
            <h3>Previous Attempts:</h3>
            {prevAttempts && prevAttempts.map( (attempt, i) => (
              <div className="quiz-preview-ind">
                <p>{i + 1}. {attempt.score}%</p>
              </div>
            ))}
            {prevAttempts.length == 0 &&
            <p style={{fontWeight:"light", fontStyle:"italic"}}>No Attempts</p>
            }

            {organizationStudentPreviousAttempts && organizationStudentPreviousAttempts.map((attempt) => (
              <div className="members-box">
                <p>{attempt.name} ({attempt.email})</p>
                <i>Score: {attempt.score}%</i>
              </div>
            ))}
            </>
          }
        </div>
      </div>
    )
}

export default QuizView