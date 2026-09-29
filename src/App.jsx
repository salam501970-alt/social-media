import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("HOME");

  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [accountType, setAccountType] = useState("8");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadSession() {
    const { data } = await supabase.auth.getSession();

    setSession(data.session);

    if (data.session?.user) {
      await loadProfile(data.session.user.id);
    }

    setLoading(false);
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(data);
    }
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

    setMessage("Welcome back ✨");
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
      setMessage("Birth year must be between 1997 and 2012.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (!data.user) {
      setMessage("Account creation failed.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        username: cleanUsername,
        account_type: accountType,
        date_of_birth: dob,
      });

    if (profileError) {
      setMessage(
        "Account created but profile setup failed: " +
          profileError.message
      );
      return;
    }

    setMessage("GENZPAGE account created 🎉");
  }

  async function logout() {
    await supabase.auth.signOut();
    setActiveTab("HOME");
  }

  function renderPage() {
    if (activeTab === "HOME") {
      return (
        <div className="page">
          <div className="top-header">
            <h1>GENZPAGE</h1>
          </div>

          <section className="section">
            <div className="section-title">
              <h2>MY 8</h2>
              <span>8 PEOPLE</span>
            </div>

            <div className="my8-row">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="my8-user" key={index}>
                  <div className="story-avatar">
                    {index + 1}
                  </div>
                  <small>USER</small>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-title">
              <h2>Trending Public</h2>
              <span>FLIPS</span>
            </div>

            <div className="post-card">
              <div className="post-header">
                <div className="mini-avatar">G</div>
                <div>
                  <strong>public_user</strong>
                  <small>PUBLIC ACCOUNT</small>
                </div>
              </div>

              <div className="post-placeholder">
                <span>PUBLIC POST</span>
              </div>

              <div className="post-actions">
                ♡ &nbsp; 💬 &nbsp; ↗ &nbsp; 🔖
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "CAMERA") {
      return (
        <div className="page center-page">
          <div className="camera-icon">◉</div>
          <h1>CAMERA</h1>
          <p>Tap → Live Photo</p>
          <p>Hold → 8-second FLIP</p>

          <button className="capture-button">
            ●
          </button>
        </div>
      );
    }

    if (activeTab === "PUBLIC") {
      return (
        <div className="page">
          <h1>PUBLIC</h1>

          <div className="filter-row">
            <button className="filter-active">POSTS</button>
            <button>FLIPS</button>
          </div>

          <div className="empty-card">
            Public posts and FLIPS will appear here.
          </div>
        </div>
      );
    }

    if (activeTab === "CHATS") {
      return (
        <div className="page">
          <h1>CHATS</h1>

          <div className="chat-card">
            <div className="mini-avatar">G</div>
            <div>
              <strong>Messages</strong>
              <p>Your conversations will appear here.</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "PROFILE") {
      return (
        <div className="page">
          <div className="profile-top">
            <div className="profile-avatar">
              {profile?.username?.charAt(0).toUpperCase() || "G"}
            </div>

            <div>
              <h1>
                @{profile?.username || "user"}
              </h1>

              <p>
                {profile?.account_type === "8"
                  ? "8 ACCOUNT"
                  : "PUBLIC ACCOUNT"}
              </p>
            </div>
          </div>

          <div className="profile-info">
            <p>GENZPAGE user</p>
            <p>Account: {profile?.account_type || "—"}</p>
          </div>

          <button className="logout-btn" onClick={logout}>
            LOGOUT
          </button>
        </div>
      );
    }

    return null;
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
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

                <label>Date of birth</label>

                <input
                  type="date"
                  value={dob}
                  onChange={(e) =>
                    setDob(e.target.value)
                  }
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
                    onClick={() =>
                      setAccountType("8")
                    }
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
                    onClick={() =>
                      setAccountType("public")
                    }
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
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="main-button"
              type="submit"
            >
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
      <main>{renderPage()}</main>

      <nav className="bottom-nav">
        <button
          className={
            activeTab === "HOME" ? "active" : ""
          }
          onClick={() => setActiveTab("HOME")}
        >
          <span>⌂</span>
          HOME
        </button>

        <button
          className={
            activeTab === "CAMERA" ? "active" : ""
          }
          onClick={() => setActiveTab("CAMERA")}
        >
          <span>◉</span>
          CAMERA
        </button>

        <button
          className={
            activeTab === "PUBLIC" ? "active" : ""
          }
          onClick={() => setActiveTab("PUBLIC")}
        >
          <span>✦</span>
          PUBLIC
        </button>

        <button
          className={
            activeTab === "CHATS" ? "active" : ""
          }
          onClick={() => setActiveTab("CHATS")}
        >
          <span>♡</span>
          CHATS
        </button>

        <button
          className={
            activeTab === "PROFILE" ? "active" : ""
          }
          onClick={() => setActiveTab("PROFILE")}
        >
          <span>●</span>
          PROFILE
        </button>
      </nav>
    </div>
  );
}

export default App;
