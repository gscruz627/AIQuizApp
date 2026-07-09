# AI QUIZ APP

AI Quiz App is an application that makes use of AI to generate a quiz, my app formats it and displays it to the user in a nice responsive UI and the user can take such quiz.

Demo here: https://aiquizapp.gustavolacruz.com

## Pictures

![Dashboard showing quizzes](/images/quizzes.png)
![Single Quiz View](/images/quiz.png)
![Organization](/images/organization.png)

## Frameworks and Tools

- Front-end: React, Javascript, KaTeX (For Math rendering)
- Back-end: C#, ASP.NET Core, Entity Framework, PostgresSQL

## Features

- User login system
- AI generation for Quizzes
- Organizations and roles such as Admin/Instructor/Student
- Responsiveness

## Current Flow

- User can login and generate quizes specifying number of questions, topic, and difficulty
- AI using Groq (Demo) generates the quiz and UI displays it to the user
- If uploaded, user can take the quiz and receive feedback on every question
- User can create an organization, receive a join code and allow new users as either instructors or students
- Instructors can see other student attempts
