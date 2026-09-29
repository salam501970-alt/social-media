import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [accountType, setAccountType] = useState("8");

  const [message, setMessage] = useState("");

  useEffect(() => {
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function getSession() {
    const { data } = await supabase.auth.getSession();

    setSession(data.session);
    setLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();

    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Welcome to GENZPAGE ✨");
  }

  async function handleSignup(e) {
    e.preventDefault();

    setMessage("");

    if (!username.trim()) {
      setMessage("Username is required");
      return;
    }

    if (!dob) {
      setMessage("Date of birth is required");
      return;
    }

    const year = new Date(dob).getFullYear();

    if (year < 1997 || year > 2012) {
      setMessage("GENZPAGE is currently limited to birth years 1997–2012.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
          account_type: accountType,
          date_of_birth: dob,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created successfully 🎉");
  }

  async function logout() {
    await supabase.auth.signOut();
    setMessage("");
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <h1>GENZPAGE</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="brand">GENZPAGE</h1>

          <p className="tagline">
            Your generation. Your page.
          </p>

          <div className="auth-switch">
            <button
              className={authMode === "login" ? "selected" : ""}
              onClick={() => {
                setAuthMode("login");
                setMessage("");
              }}
            >
              LOGIN
            </button>

            <button
              className={authMode === "signup" ? "selected" : ""}
              onClick={() => {
                setAuthMode("signup");
                setMessage("");
              }}
            >
              SIGN UP
            </button>
          </div>

          <form
            onSubmit={
              authMode === "login"
                ? handleLogin
                : handleSignup
            }
          >
            {authMode === "signup" && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <label>Date of birth</label>

                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />

                <p className="small-text">
                  Allowed birth years: 1997–2012
                </p>

                <label>Account type</label>

                <div className="account-types">
                  <button
                    type="button"
                    className={
                      accountType === "8"
                        ? "account-selected"
                        : ""
                    }
                    onClick={() => setAccountType("8")}
                  >
                    <strong>8 ACCOUNT</strong>
                    <span>Private circle</span>
                  </button>

                  <button
                    type="button"
                    className={
                      accountType === "public"
                        ? "account-selected"
                        : ""
                    }
                    onClick={() => setAccountType("public")}
                  >
                    <strong>PUBLIC ACCOUNT</strong>
                    <span>Public profile</span>
                  </button>
                </div>
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="main-button" type="submit">
              {authMode === "login"
                ? "LOGIN"
                : "CREATE ACCOUNT"}
            </button>
          </form>

          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="page center-page">
        <h1>GENZPAGE</h1>

        <div className="avatar">
          G
        </div>

        <p>You're logged in 🎉</p>

        <button className="logout-btn" onClick={logout}>
          LOGOUT
        </button>
      </main>
    </div>
  );
}

export default App;
