import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import renderMathInElement from "katex/contrib/auto-render";

export function renderMath(str = "") {
  return str.replace(/\$(.+?)\$/g, (_, expr) => {
    return katex.renderToString(expr, {
      throwOnError: false
    });
  });
}

export function useMathWatcher() {
    useEffect(() => {
        const root = document.getElementById("math-root") || document.body;

        const render = () => {
            renderMathInElement(root, {
                delimiters: [
                    { left: "\\(", right: "\\)", display: false },
                    { left: "\\[", right: "\\]", display: true }
                ]
            });
        };

        render();

        const observer = new MutationObserver(() => {
            render();
        });

        observer.observe(root, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);
}
export function logout(){
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("userid");
    window.location.href = "login"
}

let refreshPromise = null;

export async function checkAuth(navigate){
    const token = localStorage.getItem("access-token");

    if (!token) {
        navigate("/login");
        return false;
    }

    let decoded;
    try {
        decoded = jwtDecode(token);
    } catch {
        navigate("/login");
        return false;
    }

    const expMS = decoded.exp * 1000;

    if (new Date().getTime() < expMS) {
        return true;
    }

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const request = await fetch("https://localhost:7015/api/users/refresh-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    accessToken: token,
                    refreshToken: localStorage.getItem("refresh-token")
                })
            });

            if (!request.ok) {
                refreshPromise = null;
                navigate("/login");
                return false;
            }

            const tokens = await request.json();

            localStorage.setItem("access-token", tokens.accessToken);
            localStorage.setItem("refresh-token", tokens.refreshToken);

            refreshPromise = null;
            return true;

        } catch {
            refreshPromise = null;
            navigate("/login");
            return false;
        }
    })();

    return refreshPromise;
}