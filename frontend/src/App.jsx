import React, { useEffect, useState } from "react";
import { api, setToken, clearToken, getToken } from "./api";

function App() {
  const [mode, setMode] = useState(getToken() ? "app" : "login"); // login | register | app
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [name, setName] = useState("Test");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  async function loadMe() {
    setError("");
    try {
      const data = await api.me();
      setMe(data.user);
      setMode("app");
    } catch (e) {
      setMe(null);
      clearToken();
      setMode("login");
      setError(e.message);
    }
  }

  useEffect(() => {
    if (getToken()) loadMe();
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      await loadMe();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await api.register({ email, password, name });
      setToken(data.token);
      await loadMe();
    } catch (e2) {
      setError(e2.message);
    }
  }

  function onLogout() {
    clearToken();
    setMe(null);
    setMode("login");
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 520 }}>
      <h1>Bug Tracker</h1>

      {error ? (
        <div style={{ background: "#ffe6e6", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      {mode === "login" && (
        <>
          <h2>Login</h2>
          <form onSubmit={onLogin}>
            <label>Email</label>
            <input
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Password</label>
            <input
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={{ padding: "8px 12px" }} type="submit">
              Login
            </button>
          </form>

          <p style={{ marginTop: 12 }}>
            No account?{" "}
            <button onClick={() => setMode("register")}>Register</button>
          </p>
        </>
      )}

      {mode === "register" && (
        <>
          <h2>Register</h2>
          <form onSubmit={onRegister}>
            <label>Name</label>
            <input
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Email</label>
            <input
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Password</label>
            <input
              style={{ width: "100%", padding: 8, margin: "6px 0 12px" }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button style={{ padding: "8px 12px" }} type="submit">
              Create account
            </button>
          </form>

          <p style={{ marginTop: 12 }}>
            Already have an account?{" "}
            <button onClick={() => setMode("login")}>Login</button>
          </p>
        </>
      )}

      {mode === "app" && me && (
        <>
          <h2>Dashboard</h2>
          <p>
            Logged in as: <b>{me.email}</b> {me.name ? `(${me.name})` : ""}
          </p>

          <button style={{ padding: "8px 12px" }} onClick={loadMe}>
            Refresh /me
          </button>{" "}
          <button style={{ padding: "8px 12px" }} onClick={onLogout}>
            Logout
          </button>

          <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
            <b>Next:</b> aici punem Projects + Bugs UI.
          </div>
        </>
      )}
    </div>
  );
}

export default App;
