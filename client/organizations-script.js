let organizationId;

window.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href);
    organizationId = url.searchParams.get("id");
    await loadOrganizationInfo(organizationId);
    await loadJoinRequests();
    await loadMembership();
});

async function loadMembership(){
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/myrole/${organizationId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
            }
        })
        const role = await request.json();
        document.getElementById("my-role").innerHTML = role.role;
        if(role.role === "Instructor"){
            document.getElementById("create-quiz").style.display = "block";
        } else {
            document.getElementById("create-quiz").style.display = "none";
        }
    } catch(error){
        alert(error);
    }
}
async function loadOrganizationInfo(organizationId){
    try{
        const request = await fetch(`https://localhost:7015/api/organizations/${organizationId}`, {
            headers: {
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            }
        })
        const organization = await request.json();
        document.getElementById("organization-name").innerHTML = organization.name;
        document.getElementById("organization-joincode").innerHTML = organization.joinCode;
        document.getElementById("quizzes-link").href = `quizes.html?id=${organizationId}`;  
    } catch(error){
        alert(error);
    }
}

async function loadJoinRequests(){
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/joinrequests?organizationId=${organizationId}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const info = await request.json();
        const ul = document.getElementById("join-requests-list");
        for(let individual of info){
            const li = document.createElement("li");

            const p = document.createElement("p");

            p.innerHTML = individual.name + " (" + individual.email + ")";

            const denyButton = document.createElement("button");
            denyButton.innerHTML = "Deny";
            denyButton.addEventListener("click", async () => {await denyRequest(individual.id)});
            
            const allowButton = document.createElement("button");
            allowButton.innerHTML = "Allow as Student"
            allowButton.addEventListener("click", async () => {await allowRequest(individual.id, "Student")});

            const allowInstructorButton = document.createElement("button");
            allowInstructorButton.innerHTML = "Allow as Instructor"
            allowInstructorButton.addEventListener("click", async () => { await allowRequest(individual.id, "Instructor")})

            li.appendChild(p);
            li.appendChild(allowButton);
            li.appendChild(allowInstructorButton);
            li.appendChild(denyButton);
            ul.append(li);
        }
    } catch(error){
        alert(error);
    }
}

async function denyRequest(joinRequestId) {
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinRequestId}`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
                action: "Deny"
            })
        });
        await loadJoinRequests();
    } catch(error){
        alert(error);
    }
}

async function allowRequest(joinRequestId, role) {
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinRequestId}`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
                action: "Allow",
                role
            })
        });
        await loadJoinRequests();
    } catch(error){
        alert(error);
    }
}

document.getElementById("create-quiz").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = document.getElementById("create-quiz");
    const title = form["quiz-title"].value;
    const prompt = form["prompt"].value;
    try{
        const request = await fetch("https://localhost:7015/api/quizes", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
                "title": title,
                "questions": [
                    "What is a class?",
                    "What keyword creates an object?"
                ],
                "answers": [
                    [
                    "A blueprint for objects",
                    "A database table",
                    "A method",
                    "A variable"
                    ],
                    [
                    "new",
                    "create",
                    "object",
                    "class"
                    ]
                ],
                "correctAnswerIndices": [0, 0],
                "organizationId": organizationId
            })
        });
        if(request.ok){
            alert("quiz created.")
        } else{
            alert("failed to create quiz.")
        }
    } catch(error){
        alert(error);
    }
})