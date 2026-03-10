let currentQuizList = [];
let absList = [];
document.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href);
    organizationId = url.searchParams.get("id");
    if(organizationId){
        await loadQuizes(organizationId)
    } else {
        await loadQuizes();
    }

});

async function loadQuizes(organizationId = null){
    console.log(organizationId)
    try{
        route = organizationId ? `https://localhost:7015/api/quizes?organizationId=${organizationId}` : "https://localhost:7015/api/quizes";
        const request = await fetch(route, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        if(!request.ok){
            alert("Failed to load quizes.");
            return;
        }
        const quizes = await request.json();
        const ul = document.getElementById("quizes");
        absList = quizes;
        for(let quiz of quizes){
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.innerHTML = quiz.title;
            a.href = `quiz.html?quizId=${quiz.id}`;
            li.appendChild(a);
            ul.appendChild(li);
        }

    } catch(error){
        alert(error);
    }
}

document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = document.getElementById("search");
    const query = form.elements["search-query"].value;
    currentQuizList = absList.filter(quiz => quiz.title.toLowerCase().includes(query.toLowerCase()));
    const ul = document.getElementById("quizes");
    ul.innerHTML = "";
    for(let quiz of currentQuizList){
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.innerHTML = quiz.title;
        a.href = `quiz.html?quizId=${quiz.id}`;
        li.appendChild(a);
        ul.appendChild(li);
    }
});