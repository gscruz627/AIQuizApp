import { Link } from "react-router-dom";

function QuizBox({ info }) {
  const date = info.createdAt.split("T")[0].split("-");
  return (
    <Link to={`/quiz?quizId=${info.id}`}>
      <div className="quizbox-item">
        <h4>{info.title}</h4>
        <div>
          <p>
            ({info.authorName}) {date[1]}/{date[2]}/{date[0]}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default QuizBox;
