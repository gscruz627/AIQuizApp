let quizId;
document.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href);
    quizId = url.searchParams.get("quizId");
    await loadQuizInfo(quizId);
})



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