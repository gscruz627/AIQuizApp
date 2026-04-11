import { useState } from "react";
import { renderMath } from "../functions";
function QuizQuestion({ question, answers, correctIndex, display, progress, setProgress, questionIndex, generated }) {
    const [feedbackText, setFeedbackText] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Check if this question is already answered
    let answered;
    if (progress) { answered = progress[questionIndex] !== undefined; }

    function feedback(i) {
        // If already answered, do nothing
        if (answered) return;

        setSelectedIndex(i);
        setProgress(prevProgress => ({
            ...prevProgress,
            [questionIndex]: i === correctIndex // mark correct/incorrect
        }));

        setFeedbackText(i === correctIndex ? "Correct!" : "Incorrect!");
    }

    function getClassName(i) {
        if (selectedIndex === null) return "";

        if (i === correctIndex) return "correct-text";
        if (i === selectedIndex) return "incorrect-text";

        return "";
    }

    return (
    <div className="question-block" style={{ display: display }}>

        <h4
            dangerouslySetInnerHTML={{
                __html: renderMath(`${questionIndex + 1}. ${question}`)
            }}
        />

        <ul className="question-answers-container">
            {answers && answers.map((a, i) => (
                <li
                    key={i}
                    className={getClassName(i)}
                    onClick={() => !generated && !answered && feedback(i)}
                    style={{
                        pointerEvents: (generated || answered) ? "none" : "auto",
                        opacity: answered ? 0.6 : 1
                    }}
                    dangerouslySetInnerHTML={{
                        __html: renderMath(`${["A", "B", "C", "D"][i]} | ${a}`)
                    }}
                />
            ))}
        </ul>

        {feedbackText && (
            <div className="feedback-shown">
                {feedbackText}
            </div>
        )}
    </div>
);
}
export default QuizQuestion