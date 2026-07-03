import { useState } from "react";
import { Apple, Mail, X } from "lucide-react";

export default function LoginModal({
  onClose,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailAction(event) {
    event.preventDefault();

    if (!email || !password) {
      alert("Complete email and password.");
      return;
    }

    if (mode === "register") {
      await registerWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }

    onClose();
  }

  async function handleResetPassword() {
    if (!email) {
      alert("Write your email first.");
      return;
    }

    await resetPassword(email);
  }

  return (
    <div className="login-overlay">
      <div className="login-modal pro-login-modal">
        <button className="close-login" type="button" onClick={onClose}>
          <X size={20} />
        </button>

        <span className="sidebar-kicker">Welcome to Voyagr</span>
        <h2>{mode === "register" ? "Create your account" : "Log in"}</h2>
        <p>Save trips, keep favorites, manage bookings and continue planning anytime.</p>

        <div className="social-login-stack">
          <button
            type="button"
            onClick={async () => {
              await loginWithGoogle();
              onClose();
            }}
          >
            <Mail size={18} />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={async () => {
              await loginWithFacebook();
              onClose();
            }}
          >
            <div className="facebook-icon">
             <span className="facebook-icon">f</span>
            </div>
            Continue with Facebook
          </button>

          <button
            type="button"
            onClick={async () => {
              await loginWithApple();
              onClose();
            }}
          >
            <Apple size={18} />
            Continue with Apple
          </button>
        </div>

        <div className="auth-divider">
          <span />
          OR
          <span />
        </div>

        <form className="email-login-form" onSubmit={handleEmailAction}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>

          <button className="primary" type="submit">
            {mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="login-modal-footer">
          <button type="button" onClick={handleResetPassword}>
            Forgot password?
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login"
              ? "Create account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}