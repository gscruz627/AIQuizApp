import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate, useSearchParams } from "react-router-dom";
import Groq from "groq-sdk";
import QuizQuestion from "../components/QuizQuestion";
import CommonNavbar from "../components/CommonNavbar";
import { checkAuth } from "../functions";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

function GenerateQuiz() {
  const SERVER_URL = import.meta.env.VITE_URL;
  const token = localStorage.getItem("access-token");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get("organizationId");
  const [prompt, setPrompt] = useState("");
  const [questionNumber, setQuestionNumber] = useState(10);
  const [difficulty, setDifficulty] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generatedAnswers, setGeneratedAnswers] = useState([]);
  const [generatedCorrectIndices, setGeneratedCorrectIndices] = useState([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [upload, setUpload] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [failureMsg, setFailureMsg] = useState("");

  async function uploadQuiz(e) {
    e.preventDefault();
    await checkAuth(navigate);
    try {
      const request = await fetch(`${SERVER_URL}/api/quizes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: uploadTitle,
          questions: generatedQuestions,
          answers: generatedAnswers,
          correctAnswerIndices: generatedCorrectIndices,
          organizationId: organizationId ?? null,
        }),
      });
      if (!request.ok) {
        const message = await request.text();
        setFailureMsg("Error from the server: " + message);
        return;
      }
      setSuccessMsg("Quiz was uploaded! Redirecting...");
      const generatedQuiz = await request.json();
      setTimeout(() => {
        navigate(`/quiz?quizId=${generateQuiz.id}`);
      }, 3000);
    } catch (error) {
      setFailureMsg("Error from the server: " + error.message);
    }
  }

  async function generateQuiz(e) {
    e.preventDefault();
    try {
      const groq = new Groq({
        apiKey: import.meta.env.VITE_AI_KEY,
        dangerouslyAllowBrowser: true,
      });

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Listen carefully.

        Generate a quiz about this topic: **${prompt}**.

        Difficulty: **${difficulty}**

        Number of questions: **${questionNumber}** (maximum 100).

        Output **ONLY** the quiz. Do not include introductions, explanations, markdown, code blocks, numbering, bullet points, comments, or any other text.

        Each question MUST consist of **exactly six lines**, in this exact order:

        Line 1: Question

        Line 2: Answer choice A

        Line 3: Answer choice B

        Line 4: Answer choice C

        Line 5: Answer choice D

        Line 6: The zero-based index of the correct answer (0, 1, 2, or 3)

        Then immediately begin the next question using the same six-line format.

        Formatting rules (STRICT):

        * A newline is a reserved delimiter. NEVER place a newline inside a question or inside an answer.
        * Every question and every answer MUST occupy exactly one physical line.
        * If a question or answer would naturally span multiple lines, rewrite it into a single sentence instead.
        * Do NOT wrap text.
        * Do NOT insert blank lines.
        * Do NOT number the questions or answers.
        * Do NOT prefix answers with A., B., 1., -, or similar markers.
        * The sixth line MUST contain ONLY one character: 0, 1, 2, or 3.
        * Do NOT add spaces or comments to the sixth line.
        * Do NOT output any text before the first question.
        * Do NOT output any text after the final correct-answer index.
        * If generating source code, mathematical expressions, tables, or formulas, keep each answer on a single line.
        Every mathematical expression MUST be enclosed in dollar signs ($...$).

Example:

What is $\int_0^\pi \sin(x)\,dx$?

Which equals $\frac{1}{2}$?

Do NOT output TeX without surrounding dollar signs.
        The output must be perfectly machine-readable. Violating the six-line structure by adding extra newlines will make the output invalid. Ensure every question follows the format exactly.
        `,
          },
        ],
      });

      const raw = response.choices[0].message.content;

      const lines = raw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      const expectedLines = Number(questionNumber) * 6;

      if (lines.length !== expectedLines) {
        setFailureMsg(
          `The AI returned an invalid quiz format. Expected ${expectedLines} lines (${questionNumber} questions), but received ${lines.length}. Please try generating again.`,
        );
        return;
      }

      const questions = [];
      const answers = [];
      const correctIndices = [];

      for (let i = 0; i < lines.length; i += 6) {
        const question = lines[i];
        const opts = lines.slice(i + 1, i + 5);
        const correctIndex = parseInt(lines[i + 5], 10) - 1;

        questions.push(question);
        answers.push(opts);
        correctIndices.push(correctIndex);
      }

      setGeneratedQuestions(questions);
      setGeneratedAnswers(answers);
      setGeneratedCorrectIndices(correctIndices);
      setUpload(true);
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  return (
    <div>
      <CommonNavbar />
      <div className="content-sider">
        <Sidebar />

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

        <div className="main-box">
          <div className="center-box">
            <form onSubmit={(e) => generateQuiz(e)}>
              <div className="center-box-title">
                <h4>Generate Quiz {organizationId && "For Organization"} </h4>
              </div>
              <div>
                <label htmlFor="prompt">Prompt: </label>
                <br />
                <textarea
                  id="prompt"
                  className="generate-quiz-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt..."
                ></textarea>
                <br />
                <label htmlFor="difficulty">Difficulty: </label>
                <br />
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <br />
                <br />

                <label htmlFor="numberQuestions">Number of Questions: </label>
                <br />
                <input
                  id="numberQuestions"
                  type="number"
                  className="generate-quiz-numberQuestions"
                  value={questionNumber}
                  onChange={(e) => setQuestionNumber(e.target.value)}
                />
                <br />
                <br />

                <button type="submit" className="primary-btn">
                  Generate
                </button>
              </div>
            </form>
          </div>

          {upload && (
            <div className="center-box">
              <form>
                <div className="center-box-title">
                  <h4>Upload</h4>
                </div>
              </form>
              <div>
                <form onSubmit={(e) => uploadQuiz(e)}>
                  <label htmlFor="quiz_name">Quiz Name: </label>
                  <input
                    id="quiz_name"
                    type="text"
                    className="generate-quiz-numberQuestions"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  ></input>
                  <button type="submit" className="primary-btn">
                    Upload
                  </button>
                </form>
              </div>
              <br />
            </div>
          )}

          {generatedQuestions.length > 0 && (
            <div className="quiz-container">
              <div className="quiz-container-title">
                <h3>QUESTIONS</h3>
              </div>
              {generatedQuestions.map((q, i) => (
                <QuizQuestion
                  question={q}
                  answers={generatedAnswers[i]}
                  correctIndex={generatedCorrectIndices[i]}
                  generated={true}
                  questionIndex={i}
                  key={q}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenerateQuiz;
