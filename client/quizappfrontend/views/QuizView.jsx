import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { checkAuth } from "../functions";
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
  const quizId = searchParams.get("quizId");
  const [quiz, setQuiz] = useState({});
  const [saved, setSaved] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [prevAttempts, setPrevAttempts] = useState([]);
  const [seeQuestions, setSeeQuestions] = useState(false);
  const [
    organizationStudentPreviousAttempts,
    setOrganizationStudentPreviousAttempt,
  ] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [failureMsg, setFailureMsg] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);

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

    const rows = [["Question", "Option A", "Option B", "Option C", "Option D"]];

    quiz.questions.forEach((q, i) => {
      const answers = quiz.answers[i];

      rows.push([q, ...answers]);
    });

    const csvContent = rows
      .map((row) => row.map((val) => `"${val ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

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

  async function loadQuiz() {
    try {
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/quizes/${quizId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await request.json();
      if (response.organizationId) {
        const orgRequest = await fetch(
          `${SERVER_URL}/api/organizations/${response.organizationId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!orgRequest.ok) {
          const message = await orgRequest.text();
          setFailureMsg("Error from the server: " + message);
          return;
        }
        const orgResponse = await orgRequest.json();
        if (orgResponse.role == "Instructor") {
          const studentAttemptsRequest = await fetch(
            `${SERVER_URL}/api/quizes/${quizId}/student-attempts`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (!studentAttemptsRequest.ok) {
            const message = await studentAttemptsRequest.text();
            setFailureMsg("Error from the server: " + message);
            return;
          }
          const studentAttemptsResponse = await studentAttemptsRequest.json();
          setOrganizationStudentPreviousAttempt(studentAttemptsResponse);
        }
      }

      setQuiz(response);
      const savedResponse = await fetch(
        `${SERVER_URL}/api/quizes/saved/${quizId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        },
      );
      const status = await savedResponse.json();
      setSaved(status.saved);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function save() {
    try {
      await checkAuth(navigate);
      const response = await fetch(`${SERVER_URL}/api/quizes/save/${quizId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setSaved(true);
      } else {
        const message = await request.text();
        setFailureMsg("Failed to save quiz: " + message);
      }
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function unsave() {
    try {
      await checkAuth(navigate);
      const response = await fetch(
        `${SERVER_URL}/api/quizes/unsave/${quizId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access-token")}`,
          },
        },
      );
      if (response.ok) {
        setSaved(false);
      } else {
        const message = await request.text();
        setFailureMsg("Failed to unsave quiz: " + message);
      }
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function loadAttempts() {
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/quizes/attempts/${quiz.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const response = await request.json();
      setPrevAttempts(response);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function deleteQuiz() {
    await checkAuth(navigate);
    try {
      const response = await fetch(`${SERVER_URL}/api/quizes/${quizId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token})}`,
        },
      });
      if (response.ok) {
        setSuccessMsg("Quiz deleted successfully");
        navigate("/home");
      } else {
        const message = await request.text();
        setFailureMsg("Error from the server: " + message);
      }
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  async function submitQuiz() {
    await checkAuth(navigate);
    if (quizDone) {
      setTakingQuiz(false);
      return;
    }
    if (!quizDone) {
      setQuizDone(true);
      try {
        const request = await fetch(`${SERVER_URL}/api/quizes/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quizId: quiz.id,
            score: Math.round(
              (Object.values(progress).filter((v) => v === true).length /
                quiz.questions.length) *
                100,
            ),
          }),
        });
        if (!request.ok) {
          const message = request.text();
          setFailureMsg("Error submitting your quiz: " + message);
        }
      } catch (error) {
        setFailureMsg("There was an error from the server: " + error.message);
      }
      return;
    }
  }

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (quiz && quiz.id) {
      loadAttempts();
    }
  }, [quiz]);

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
                <p>Are you sure you want to delete the quiz? </p>
                <button
                  type="button"
                  className="cancel-btn"
                  style={{ display: "inline" }}
                  onClick={() => deleteQuiz()}
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
            <h1 className="primary-color">{quiz && quiz.title}</h1>
            {quiz.authorId == localStorage.getItem("userid") && (
              <button
                className="cancel-btn"
                onClick={() => setOpenConfirm(true)}
              >
                DELETE
              </button>
            )}
          </div>

          <br />

          {takingQuiz ? (
            <button className="cancel-btn" onClick={() => setTakingQuiz(false)}>
              STOP
            </button>
          ) : (
            <button className="primary-btn" onClick={() => setTakingQuiz(true)}>
              START
            </button>
          )}

          {takingQuiz ? (
            <>
              {quizIndex == quiz.questions.length - 1 ? (
                <button className="blue-btn" onClick={() => submitQuiz()}>
                  {quizDone ? "Go Back to the Quiz" : "Submit Quiz"}
                </button>
              ) : (
                <p></p>
              )}

              <div className="quiz-container">
                <div className="quiz-container-title spaced-between">
                  {quizDone ? (
                    <h3>SUMMARY</h3>
                  ) : (
                    <>
                      <h3>
                        SCORE: &nbsp;
                        {
                          Object.values(progress).filter((v) => v === true)
                            .length
                        }{" "}
                        out of {quiz.questions.length}
                      </h3>

                      <div>
                        <span
                          onClick={() => setQuizIndex((prev) => prev - 1)}
                          style={{
                            cursor: "pointer",
                            color: "#FFF",
                            fontSize: "24px",
                            display: quizIndex == 0 ? "none" : "inline",
                          }}
                        >
                          <i className="fa-solid fa-circle-left"></i>
                        </span>
                        &nbsp; &nbsp;
                        <span
                          style={{
                            cursor: "pointer",
                            color: "#FFF",
                            fontSize: "24px",
                            display:
                              quizIndex == quiz.questions.length - 1
                                ? "none"
                                : "inline",
                          }}
                          onClick={() => setQuizIndex((prev) => prev + 1)}
                        >
                          <i className="fa-solid fa-circle-right"></i>
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {quiz &&
                  quiz.questions &&
                  quiz.questions.map((q, i) => (
                    <QuizQuestion
                      progress={progress}
                      setProgress={setProgress}
                      question={quiz.questions[i]}
                      answers={quiz.answers[i]}
                      display={i == quizIndex || quizDone ? "block" : "none"}
                      questionIndex={i}
                      key={i}
                      setFailureMsg={setFailureMsg}
                      quizId={quizId}
                    />
                  ))}
              </div>
            </>
          ) : (
            <>
              <div className="spaced-between">
                <br />
                <ul>
                  <button
                    style={{ backgroundColor: "#b01515" }}
                    onClick={() => exportToPDF()}
                  >
                    <i className="fa-solid fa-file-pdf"></i> PDF
                  </button>
                  &nbsp;
                  <button
                    style={{ backgroundColor: "#197e18" }}
                    onClick={() => exportToCSV()}
                  >
                    <i className="fa-solid fa-file-csv"></i> CSV
                  </button>
                  &nbsp;
                  <button
                    style={{ backgroundColor: "#bf8329" }}
                    onClick={() => exportToQTI()}
                  >
                    <i className="fa-regular fa-file-lines"></i> QTI
                  </button>
                </ul>
              </div>

              <br />

              {saved ? (
                <button onClick={() => unsave()} className="cancel-btn">
                  UN-SAVE
                </button>
              ) : (
                <button onClick={() => save()} className="blue-btn">
                  SAVE
                </button>
              )}
              <br />
              <br />

              <h3
                className="clickable-link primary-color"
                onClick={() => setSeeQuestions(!seeQuestions)}
              >
                {seeQuestions ? "HIDE" : "PREVIEW"}
              </h3>

              <br />

              {seeQuestions && (
                <div className="main-inner-box">
                  <h3>PREVIEW QUESTIONS</h3>
                  {quiz &&
                    quiz.questions.map((question, i) => (
                      <div className="quizbox-item" key={question}>
                        <h4 key={i}>
                          {i + 1}. {question}
                        </h4>
                      </div>
                    ))}
                </div>
              )}
              <br />

              <div className="main-inner-box">
                <h3 className="primary-color">ATTEMPTS</h3>
                {prevAttempts &&
                  prevAttempts.map((attempt, i) => (
                    <div className="quizbox-item" key={i}>
                      <h4>Attempt {i + 1}</h4>
                      <i>{attempt.score}%</i>
                    </div>
                  ))}
                {prevAttempts.length == 0 && (
                  <div className="quizbox-item">
                    <h4>No Attempts yet</h4>
                  </div>
                )}
              </div>

              {organizationStudentPreviousAttempts &&
                organizationStudentPreviousAttempts.map((attempt, i) => (
                  <div className="members-box" key={i}>
                    <p>
                      {attempt.name} ({attempt.email})
                    </p>
                    <i>Score: {attempt.score}%</i>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizView;
