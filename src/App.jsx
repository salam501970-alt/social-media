import { useState } from "react";
import "./App.css";

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(true);
  const [accountType, setAccountType] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const checkDOB = (value) => {
    setDob(value);
    setError("");

    if (!value) return;

    const year = new Date(value).getFullYear();

    if (year < 1997 || year > 2012) {
      setError("Only users born from 1997 to 2012 are allowed.");
    }
  };

  const createAccount = () => {
    if (!dob) {
      setError("Please enter your date of birth.");
      return;
    }

    const year = new Date(dob).getFullYear();

    if (year < 1997 || year > 2012) {
      setError("This date of birth is not allowed.");
      return;
    }

    if (!accountType) {
      setError("Please choose an account type.");
      return;
    }

    setShowAuth(false);
  };

  if (showAuth) {
    return (
      <div className="auth-page">

        <div className="auth-glow glow-one"></div>
        <div className="auth-glow glow-two"></div>

        <div className="auth-container">

          <div className="brand">
            <div className="brand-symbol">I</div>
            <h1>INKCRYPT</h1>
            <p>YOUR WORLD. YOUR CIRCLE.</p>
          </div>

          <div className="auth-card">

            {authMode === "login" ? (
              <>
                <h2>Welcome back</h2>
                <p className="auth-text">
                  Enter your details to continue
                </p>

                <input
                  type="text"
                  placeholder="Username or email"
                />

                <input
                  type="password"
                  placeholder="Password"
                />

                <button
                  className="primary-btn"
                  onClick={() => setShowAuth(false)}
                >
                  LOGIN
                </button>

                <button className="forgot">
                  Forgot password?
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <p className="switch-text">
                  Don't have an account?
                  <button
                    onClick={() => {
                      setAuthMode("signup");
                      setError("");
                    }}
                  >
                    Create account
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2>Create account</h2>
                <p className="auth-text">
                  Join the INKCRYPT community
                </p>

                <input
                  type="text"
                  placeholder="Username"
                />

                <input
                  type="email"
                  placeholder="Email"
                />

                <input
                  type="password"
                  placeholder="Password"
                />

                <label className="field-label">
                  Date of birth
                </label>

                <input
                  type="date"
                  value={dob}
                  onChange={(e) =>
                    checkDOB(e.target.value)
                  }
                />

                {error && (
                  <p className="error-text">
                    {error}
                  </p>
                )}

                <label className="field-label">
                  Account type
                </label>

                <div className="account-options">

                  <button
                    className={
                      accountType === "8"
                        ? "account-option selected"
                        : "account-option"
                    }
                    onClick={() =>
                      setAccountType("8")
                    }
                  >
                    <span className="option-icon">
                      8
                    </span>

                    <div>
                      <strong>8 ACCOUNT</strong>
                      <small>
                        Your private circle
                      </small>
                    </div>
                  </button>

                  <button
                    className={
                      accountType === "public"
                        ? "account-option selected"
                        : "account-option"
                    }
                    onClick={() =>
                      setAccountType("public")
                    }
                  >
                    <span className="option-icon">
                      ◉
                    </span>

                    <div>
                      <strong>PUBLIC ACCOUNT</strong>
                      <small>
                        Share with everyone
                      </small>
                    </div>
                  </button>

                </div>

                <button
                  className="primary-btn"
                  onClick={createAccount}
                >
                  CREATE ACCOUNT
                </button>

                <p className="switch-text">
                  Already have an account?
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            )}

          </div>

          <p className="copyright">
            © 2026 INKCRYPT
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="app">

      <header className="topbar">
        <div className="mini-brand">
          <span>I</span>
          INKCRYPT
        </div>

        <button className="notification">
          ♡
        </button>
      </header>

      <main className="home">
        <section className="my8">
          <div className="section-title">
            <h2>MY 8</h2>
            <span>24H</span>
          </div>

          <div className="story-list">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="story" key={i}>
                <div className="story-avatar">
                  {i + 1}
                </div>
                <small>User {i + 1}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="trending">
          <div className="section-title">
            <h2>Trending Public</h2>
            <span>LIVE</span>
          </div>

          <div className="post">
            <div className="post-user">
              <div className="avatar">I</div>
              <div>
                <strong>inkuser</strong>
                <small>Public account</small>
              </div>
            </div>

            <div className="post-media">
              PUBLIC POST
            </div>

            <div className="post-actions">
              <button>♡</button>
              <button>○</button>
              <button>↗</button>
              <button>⌑</button>
            </div>

            <p>
              Welcome to INKCRYPT.
            </p>
          </div>
        </section>
      </main>

      <nav className="bottom-nav">
        <button className="active">HOME</button>
        <button>CAMERA</button>
        <button>PUBLIC</button>
        <button>CHATS</button>
        <button>PROFILE</button>
      </nav>

    </div>
  );
}

export default App;
