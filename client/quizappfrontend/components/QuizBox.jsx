import React from 'react'
import { Link } from 'react-router-dom';

function QuizBox({info}) {
  const date = info.createdAt.split("T")[0].split("-");
  return (
    <Link to={`/quiz?quizId=${info.id}`}>
      <div className="quizbox-item">
          <h3>{info.title}</h3>
          <div>
              <p>{info.authorName}</p>
              <p>{date[2]}/{date[1]}/{date[0]}</p>
          </div>
      </div>
    </Link>
  )
}

export default QuizBox