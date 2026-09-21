import { useEffect, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(true);

  const [accountType, setAccountType] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState("HOME");
  const [profile, setProfile] = useState(null);

  const [cameraStream, setCameraStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);

  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setShowAuth(!session);

      if (session) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      stopCamera();
    };
  }, []);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setShowAuth(false);
      await loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId) => {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profileError && data) {
      setProfile(data);
    }
  };

  const checkDOB = (value) => {
    setDob(value);
    setError("");
    setMessage("");

    if (!value) return;

    const year = new Date(value).getFullYear();

    if (year < 1997 || year > 2012) {
      setError("Only users born from 1997 to 2012 are allowed.");
    }
  };

  const createAccount = async () => {
    setError("");
    setMessage("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!dob) {
      setError("Please enter your date of birth.");
      return;
    }

    const year = new Date(dob).getFullYear();

    if (year < 1997 || year > 2012) {
      setError("Only users born from 1997 to 2012 are allowed.");
      return;
    }

    if (!accountType) {
      setError("Please choose an account type.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: signupError,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      setError("Account could not be created.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: username.trim(),
        date_of_birth: dob,
        account_type: accountType,
      });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    setLoading(false);
    setMessage("Account created successfully!");

    setShowAuth(false);
    await loadProfile(user.id);
  };

  const login = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    setShowAuth(false);

    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const logout = async () => {
    stopCamera();

    await supabase.auth.signOut();

    setProfile(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setAccountType("");
    setDob("");
    setError("");
    setMessage("");
    setCurrentPage("HOME");
    setShowAuth(true);
    setAuthMode("login");
  };

  const navigate = (page) => {
    stopCamera();
    setCapturedMedia(null);
    setCurrentPage(page);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setCameraStream(stream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError("Camera permission was denied or camera is unavailable.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL("image/jpeg");

    setCapturedMedia({
      type: "photo",
      url: image,
    });
  };

  const toggleLike = (postId) => {
    setLikedPosts((previous) => {
      if (previous.includes(postId)) {
        return previous.filter((id) => id !== postId);
      }

      return [...previous, postId];
    });
  };

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: chatMessage.trim(),
        sender: "You",
      },
    ]);

    setChatMessage("");
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
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />

                {error && (
                  <p className="error-text">{error}</p>
                )}

                {message && (
                  <p className="success-text">{message}</p>
                )}

                <button
                  className="primary-btn"
                  onClick={login}
                  disabled={loading}
                >
                  {loading ? "LOGGING IN..." : "LOGIN"}
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
                      setMessage("");
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
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
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
                  <p className="error-text">{error}</p>
                )}

                <label className="field-label">
                  Account type
                </label>

                <div className="account-options">

                  <button
                    type="button"
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
                    type="button"
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
                      <strong>
                        PUBLIC ACCOUNT
                      </strong>

                      <small>
                        Share with everyone
                      </small>
                    </div>
                  </button>

                </div>

                <button
                  className="primary-btn"
                  onClick={createAccount}
                  disabled={loading}
                >
                  {loading
                    ? "CREATING..."
                    : "CREATE ACCOUNT"}
                </button>

                <p className="switch-text">
                  Already have an account?

                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                      setMessage("");
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

        <button
          className="notification"
          onClick={() => setMessage("No new notifications")}
        >
          ♡
        </button>

      </header>

      <main className="home">

        {currentPage === "HOME" && (
          <>
            <section className="my8">

              <div className="section-title">
                <h2>MY 8</h2>
                <span>24H</span>
              </div>

              <div className="story-list">

                {Array.from(
                  { length: 8 },
                  (_, i) => (
                    <div
                      className="story"
                      key={i}
                    >
                      <div className="story-avatar">
                        {i + 1}
                      </div>

                      <small>
                        User {i + 1}
                      </small>
                    </div>
                  )
                )}

              </div>

            </section>

            <section className="trending">

              <div className="section-title">

                <h2>
                  Home Feed
                </h2>

                <span>
                  LIVE
                </span>

              </div>

              {posts.length === 0 ? (
                <div className="empty-state">
                  <h3>Welcome to INKCRYPT</h3>

                  <p>
                    Your feed is ready.
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      navigate("CAMERA")
                    }
                  >
                    CREATE POST
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    className="post"
                    key={post.id}
                  >

                    <div className="post-user">

                      <div className="avatar">
                        I
                      </div>

                      <div>
                        <strong>
                          {post.username}
                        </strong>

                        <small>
                          Public account
                        </small>
                      </div>

                    </div>

                    <div className="post-media">
                      {post.content}
                    </div>

                    <div className="post-actions">

                      <button
                        onClick={() =>
                          toggleLike(post.id)
                        }
                      >
                        {likedPosts.includes(post.id)
                          ? "♥"
                          : "♡"}
                      </button>

                      <button>
                        ○
                      </button>

                      <button>
                        ↗
                      </button>

                      <button>
                        ⌑
                      </button>

                    </div>

                  </div>
                ))
              )}

            </section>
          </>
        )}

        {currentPage === "CAMERA" && (
          <section className="page">

            <h2>CAMERA</h2>

            <p>
              Tap to capture a photo.
            </p>

            <div className="camera-box">

              {cameraStream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="camera-video"
                  />

                  <button
                    className="capture-btn"
                    onClick={capturePhoto}
                  >
                    ●
                  </button>
                </>
              ) : (
                <button
                  className="primary-btn"
                  onClick={startCamera}
                >
                  OPEN CAMERA
                </button>
              )}

            </div>

            <canvas
              ref={canvasRef}
              style={{ display: "none" }}
            />

            {capturedMedia && (
              <div className="captured">

                <h3>
                  Captured
                </h3>

                <img
                  src={capturedMedia.url}
                  alt="Captured"
                />

                <button
                  className="primary-btn"
                  onClick={() => {
                    setPosts((previous) => [
                      ...previous,
                      {
                        id: Date.now(),
                        username:
                          profile?.username ||
                          "You",
                        content:
                          "NEW PHOTO POST",
                      },
                    ]);

                    setCapturedMedia(null);
                    stopCamera();
                    navigate("HOME");
                  }}
                >
                  POST
                </button>

              </div>
            )}

          </section>
        )}

        {currentPage === "PUBLIC" && (
          <section className="page">

            <div className="section-title">

              <h2>
                PUBLIC
              </h2>

              <span>
                FLIPS
              </span>

            </div>

            <div className="public-card">
              <h3>
                Public Discovery
              </h3>

              <p>
                Discover public posts and FLIPS.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  setMessage(
                    "Public discovery is ready for backend posts."
                  )
                }
              >
                EXPLORE
              </button>
            </div>

            <div className="public-card">
              <h3>
                FLIPS
              </h3>

              <p>
                Create and watch short 8-second videos.
              </p>

              <button
                className="primary-btn"
                onClick={() =>
                  navigate("CAMERA")
                }
              >
                CREATE FLIP
              </button>
            </div>

          </section>
        )}

        {currentPage === "CHATS" && (
          <section className="page chat-page">

            <h2>
              CHATS
            </h2>

            <div className="chat-list">

              <div className="chat-user">
                <div className="avatar">
                  A
                </div>

                <div>
                  <strong>
                    Message Requests
                  </strong>

                  <small>
                    No new requests
                  </small>
                </div>
              </div>

              <div className="chat-user">
                <div className="avatar">
                  G
                </div>

                <div>
                  <strong>
                    Group Chat
                  </strong>

                  <small>
                    Start a conversation
                  </small>
                </div>
              </div>

            </div>

            <div className="messages">

              {messages.length === 0 ? (
                <p>
                  No messages yet.
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    className="message"
                    key={msg.id}
                  >
                    <strong>
                      {msg.sender}
                    </strong>

                    <span>
                      {msg.text}
                    </span>
                  </div>
                ))
              )}

            </div>

            <div className="chat-input">

              <input
                type="text"
                placeholder="Message..."
                value={chatMessage}
                onChange={(e) =>
                  setChatMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
              >
                SEND
              </button>

            </div>

          </section>
        )}

        {currentPage === "PROFILE" && (
          <section className="page profile-page">

            <div className="profile-avatar">
              {profile?.username
                ? profile.username
                    .charAt(0)
                    .toUpperCase()
                : "I"}
            </div>

            <h2>
              @{profile?.username || "user"}
            </h2>

            <p>
              {profile?.account_type === "8"
                ? "8 ACCOUNT"
                : "PUBLIC ACCOUNT"}
            </p>

            <div className="profile-info">

              <div>
                <strong>
                  0
                </strong>

                <small>
                  Posts
                </small>
              </div>

              <div>
                <strong>
                  0
                </strong>

                <small>
                  Followers
                </small>
              </div>

              <div>
                <strong>
                  0
                </strong>

                <small>
                  Following
                </small>
              </div>

            </div>

            <button
              className="primary-btn"
              onClick={() =>
                setMessage(
                  "Profile editing will be added next."
                )
              }
            >
              EDIT PROFILE
            </button>

            <button
              className="logout-btn"
              onClick={logout}
            >
              LOGOUT
            </button>

          </section>
        )}

      </main>

      {message && (
        <div className="toast">
          {message}
        </div>
      )}

      <nav className="bottom-nav">

        <button
          className={
            currentPage === "HOME"
              ? "active"
              : ""
          }
          onClick={() => navigate("HOME")}
        >
          HOME
        </button>

        <button
          className={
            currentPage === "CAMERA"
              ? "active"
              : ""
          }
          onClick={() => navigate("CAMERA")}
        >
          CAMERA
        </button>

        <button
          className={
            currentPage === "PUBLIC"
              ? "active"
              : ""
          }
          onClick={() => navigate("PUBLIC")}
        >
          PUBLIC
        </button>

        <button
          className={
            currentPage === "CHATS"
              ? "active"
              : ""
          }
          onClick={() => navigate("CHATS")}
        >
          CHATS
        </button>

        <button
          className={
            currentPage === "PROFILE"
              ? "active"
              : ""
          }
          onClick={() => navigate("PROFILE")}
        >
          PROFILE
        </button>

      </nav>

    </div>
  );
}

export default App;
