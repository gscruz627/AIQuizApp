let quizId;
document.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href);
    quizId = url.searchParams.get("quizId");
    await loadQuizInfo(quizId);
})

async function loadQuizInfo(quizId){
    try{
        const response = await fetch(`https://localhost:7015/api/quizes/${quizId}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const quiz = await response.json();
        const savedResponse = await fetch(`https://localhost:7015/api/quizes/saved/${quizId}/`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const saved = await savedResponse.json();
        if(saved.saved){
            document.getElementById("save-status").innerHTML = "Saved";
            document.getElementById("save").disabled = true;
        }
        document.getElementById("quiz-title").innerHTML = quiz.title;
        if(quiz.authorId == localStorage.getItem("userid")){
            document.getElementById("delete").style.display = "block";
        } else {
            document.getElementById("delete").style.display = "none";
        }
        // Need to ensure a proper 404 page
    } catch(error){
        alert(error);
    }
}

async function deleteQuiz(){
    try{
        const response = await fetch(`https://localhost:7015/api/quizes/${quizId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        if(response.ok){
            alert("Quiz deleted successfully");
            window.location.href = "index.html";
        } else {
            alert("Failed to delete quiz");
        }
    } catch(error){
        alert(error);
    }
}

document.getElementById("save").addEventListener("click", async () => {
    try{
        const response = await fetch(`https://localhost:7015/api/quizes/save/${quizId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`,
            }
        });
        if(response.ok){
            document.getElementById("save-status").innerHTML = "Saved quiz.";
            document.getElementById("save").disabled = true;
            alert("Saved.");
        } else {
            alert("FAiled to save quiz");
        }
    } catch(error){
        alert(error);
    }
});