import { jwtDecode } from "jwt-decode";
import { InlineMath } from "react-katex";
export function renderMath(text) {
  const parts = text.split(/(\$.*?\$)/g);

  return parts.map((part, i) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      return <InlineMath key={i} math={part.slice(1, -1)} />;
    }

    return <span key={i}>{part}</span>;
  });
}
export function logout() {
  localStorage.removeItem("access-token");
  localStorage.removeItem("refresh-token");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("userid");
  window.location.href = "login";
}

let refreshPromise = null;

export async function checkAuth(navigate) {
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
  const SERVER_URL = import.meta.env.VITE_URL;
  refreshPromise = (async () => {
    try {
      const request = await fetch(`${SERVER_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          accessToken: token,
          refreshToken: localStorage.getItem("refresh-token"),
        }),
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
