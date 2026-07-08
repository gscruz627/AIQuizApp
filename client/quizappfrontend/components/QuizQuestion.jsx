import { useState } from "react";
import { checkAuth, renderMath } from "../functions";
function QuizQuestion({
  question,
  answers,
  display,
  progress,
  setProgress,
  questionIndex,
  generated,
  quizId,
  setFailureMsg,
}) {
  const SERVER_URL = import.meta.env.VITE_URL;
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);

  const token = localStorage.getItem("access-token");

  // Check if this question is already answered
  let answered;
  if (progress) {
    answered = progress[questionIndex] !== undefined;
  }

  async function feedback(i) {
    await checkAuth();
    // If already answered, do nothing
    if (answered) return;
    setSelectedIndex(i);
    try {
      console.log("b");
      const request = await fetch(
        `${SERVER_URL}/api/quizes/${quizId}/answer/${questionIndex}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: {
            selectedAnswer: i,
          },
        },
      );
      console.log("here");
      const correctIndex = Number(await request.json());

      setCorrectIndex(correctIndex);

      setProgress((prevProgress) => ({
        ...prevProgress,
        [questionIndex]: i === correctIndex,
      }));

      setFeedbackText(i === correctIndex ? "Correct!" : "Incorrect!");
    } catch (error) {
      setFailureMsg("There was an error from the server: " + error.message);
    }
  }

  function getClassName(i) {
    if (correctIndex === null || selectedIndex === null) return "";

    if (i === correctIndex) return "correct-text";

    if (i === selectedIndex && selectedIndex !== correctIndex)
      return "incorrect-text";

    return "";
  }

  return (
    <div className="question-block" style={{ display: display }}>
      <h4>
        {questionIndex + 1}. {renderMath(question)}
      </h4>

      <ul className="question-answers-container">
        {answers &&
          answers.map((a, i) => (
            <li
              key={a}
              className={getClassName(i)}
              onClick={() => !generated && !answered && feedback(i)}
              style={{
                pointerEvents: generated || answered ? "none" : "auto",
                opacity: answered ? 0.6 : 1,
              }}
            >
              {["A", "B", "C", "D"][i]} | {renderMath(a)}
            </li>
          ))}
      </ul>

      {feedbackText && (
        <div
          style={{
            padding: "1rem",
            fontWeight: "bold",
            color: feedbackText == "Correct!" ? "#20c820" : "#d51111",
          }}
        >
          {feedbackText == "Correct!" && (
            <i className="fa-solid fa-square-check"></i>
          )}
          {feedbackText == "Incorrect!" && (
            <i className="fa-solid fa-circle-xmark"></i>
          )}
          &nbsp; {feedbackText}
        </div>
      )}
    </div>
  );
}
export default QuizQuestion;
