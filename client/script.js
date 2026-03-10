window.addEventListener("DOMContentLoaded", async () => {
    await loadMyOrganizations();
    await loadPendingRequests();
    await loadSavedQuizes();
    authInitial();
})

document.getElementById("logout-btn").addEventListener("click", () => {

    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("userid");

    authInitial();
})

function authInitial(){
    // Check if user is logged in and filled as needed
    const username = localStorage.getItem("username");
    if(username){
        document.getElementById("username").innerHTML = username;
        document.getElementById("auth").style.display = "none";

    } else {
        // Not logged In, hide information, show register/login form.
        document.getElementById("username").innerHTML = "Not Logged In.";
        document.getElementById("username").style.color = "red";
        document.getElementById("create-organization").style.display = "none";
        document.getElementById("join-organization").style.display = "none";
        document.getElementById("pending-join-requests").style.display = "none";
        document.getElementById("organizations").style.display = "none";
        document.getElementById("quizzes-list").style.display = "none";
        document.getElementById("auth").style.display = "block";
    }
}

async function register(){
    const form = document.getElementById("auth");

    const username = form["auth-username"].value;
    const password = form["auth-password"].value;
    const email = form["auth-email"].value;

    try{
        const request = await fetch("https://localhost:7015/api/users", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                name: username,
                password,
                email
            })
        });
    } catch(error){
        alert(error);
        return;
    }
    alert("registered ok.")

}

async function login(){
    const form = document.getElementById("auth");

    const password = form["auth-password"].value;
    const email = form["auth-email"].value;

    try{
        const request = await fetch("https://localhost:7015/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        })
        const tokens = await request.json();
        const decoded = jwt_decode(tokens.accessToken);
        const email_decoded = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        const userid = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        localStorage.setItem("access-token", tokens.accessToken);
        localStorage.setItem("refresh-token", tokens.refreshToken);
        localStorage.setItem("username", decoded.name);
        localStorage.setItem("email", email_decoded);
        localStorage.setItem("userid", userid);
    } catch(error){
        alert(error);
        return;
    }
    alert("signed in.")
    authInitial();
}

document.getElementById("create-organization").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = document.getElementById("create-organization");
    const title = form["organization-title"].value;
    try{
        const request = await fetch("https://localhost:7015/api/organizations", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
                name: title
            })
        });
        if(request.ok){
            const organization = await request.json();
            const ul = document.getElementById("organizations")
            const li = document.createElement("li");
            const atag = document.createElement("a");
            atag.href = "/organization/" + organization.id;
            atag.innerHTML = organization.name
            li.appendChild(atag);
            ul.appendChild(li);
            alert("created.")
        } else{
            alert("failed to create.")
        }
    } catch(error){
        alert("error");
    }
})

async function loadMyOrganizations(){
    try{
        const request = await fetch(`https://localhost:7015/api/organizations/info?userId=${localStorage.getItem("userid")}`, {
            method: "GET",
            headers: {
                "Authorization" :  `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const organizations = await request.json();
        const ul = document.getElementById("organizations")
        const lis = ul.querySelectorAll("li");
        lis.forEach(li => li.remove())
        for(let organization of organizations){
            const li = document.createElement("li");
            const atag = document.createElement("a");
            atag.href = "./organization.html?id=" + organization.id;
            atag.innerHTML = organization.name
            li.appendChild(atag);
            ul.appendChild(li);
        }

    } catch(error){
        alert(error);
    }
}

document.getElementById("join-organization").addEventListener("submit", async (event) => {
    event.preventDefault();
    const joinCode = document.getElementById("join-code").value;
    try{
        const request = await fetch("https://localhost:7015/api/memberships/join", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
            },
            body: JSON.stringify({
                joinCode
            })
        })
        if (!request.ok) {
            const errorMessage = await request.text();
            alert(errorMessage);
            return;
        }
        const info = await request.json();
        console.log(info);
        const ul = document.getElementById("pending-join-requests")
        const li = document.createElement("li");
        li.innerHTML = info.orgName;
        const cancelButton = document.createElement("button");
        cancelButton.innerHTML = "Cancel Request";
        cancelButton.addEventListener("click", async () => { await cancelJoinRequest(info.id)});
        li.appendChild(cancelButton);
        ul.appendChild(li);
        alert("access requested!")
    } catch(error){
        alert(error);
    }
});

async function cancelJoinRequest(joinrequestid){
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/resolution/${joinrequestid}`, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            }, body: JSON.stringify({
                "action": "Cancel"
            })
        })
        if(request.ok){
            alert("canceled")
            await loadPendingRequests();
        } else{
            alert("failed to cancel request.")
        }
    }   catch(error){
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
                "correctAnswerIndices": [0, 0]
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

async function loadPendingRequests(){
    try{
        const request = await fetch(`https://localhost:7015/api/memberships/joinrequests?userId=${localStorage.getItem("userid")}`, {
            headers: {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("access-token")}`
            }
        })
        const info = await request.json();
        const ul = document.getElementById("pending-join-requests")
        for(let individual of info){
            const li = document.createElement("li");
            li.innerHTML = individual.orgName;
            const cancelButton = document.createElement("button");
            cancelButton.innerHTML = "Cancel Request";
            cancelButton.addEventListener("click", async () => { await cancelJoinRequest(individual.id)});
            li.appendChild(cancelButton);
            ul.appendChild(li);
        }
    } catch(error){
        alert(error);
    }
}

async function loadSavedQuizes(){
    try{ 
        const request = await fetch(`https://localhost:7015/api/quizes?saved=true`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access-token")}`
            }
        });
        const info = await request.json();
        const ul = document.getElementById("quizzes-list");
        for(let individual of info){
            const li = document.createElement("li");
            li.innerHTML = individual.title;
            const viewButton = document.createElement("button");
            viewButton.innerHTML = "View";
            viewButton.addEventListener("click", async () => { window.location.href = `quiz.html?quizId=${individual.id}`});
            li.appendChild(viewButton);
            ul.appendChild(li);
        }
    } catch(error){
        alert(error);

    }
}