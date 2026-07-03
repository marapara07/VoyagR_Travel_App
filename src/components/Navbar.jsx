import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import LoginModal from "./LoginModal";

export default function Navbar({
  user,
  loginWithGoogle,
  loginWithFacebook,
  loginWithApple,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
  logout,
  currentPage,
  setCurrentPage,
}) {
  const [showLogin, setShowLogin] = useState(false);

  function goPlanner(anchor = "top") {
    setCurrentPage("planner");
    setTimeout(() => {
      if (anchor === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(anchor)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 80);
  }

  function openAccount() {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setCurrentPage("account");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
  }

  return (
    <>
      <nav className="top-navbar">
        <button
          className="nav-logo logo-button"
          type="button"
          onClick={() => goPlanner("top")}
          aria-label="Voyagr home"
        >
          <span className="voyag">VOYAG</span>
          <span className="voyagr-r">R</span>
        </button>

        <div className="nav-links">
          <button type="button" onClick={() => goPlanner("explore")}>
            Explore
          </button>
          <button type="button" onClick={() => goPlanner("stays")}>
            Stays
          </button>
          <button type="button" onClick={() => goPlanner("map")}>
            Map
          </button>
          <button type="button" onClick={() => goPlanner("itinerary")}>
            Itinerary
          </button>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-action-row">
              <button
                className={`nav-login user-button ${
                  currentPage === "account" ? "active" : ""
                }`}
                type="button"
                onClick={openAccount}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" />
                ) : (
                  <UserRound size={18} />
                )}
                <span>{user.name}</span>
              </button>

              <button
                className="mini-logout"
                type="button"
                onClick={() => {
                  logout();
                  setCurrentPage("planner");
                }}
                title="Log out"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button
              className="nav-login"
              type="button"
              onClick={() => setShowLogin(true)}
            >
              Log in
            </button>
          )}
        </div>
      </nav>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          loginWithGoogle={loginWithGoogle}
          loginWithFacebook={loginWithFacebook}
          loginWithApple={loginWithApple}
          loginWithEmail={loginWithEmail}
          registerWithEmail={registerWithEmail}
          resetPassword={resetPassword}
        />
      )}
    </>
  );
}