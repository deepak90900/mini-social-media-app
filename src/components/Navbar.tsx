import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-blue-600 text-white p-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Brand */}
        <h1 onClick={() => navigate("/")} className="cursor-pointer text-lg">
          Mini Social Media
        </h1>

        {/* Hamburger Icon for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span
                className="cursor-pointer"
                onClick={() => navigate("/feeds")}
              >
                Feeds
              </span>
              <span
                className="cursor-pointer"
                onClick={() => navigate("/saved-posts")}
              >
                Saved Posts
              </span>
              <span
                className="cursor-pointer"
                onClick={() => navigate("/my-posts")}
              >
                My Posts
              </span>
              <span>{user.displayName || user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu (Collapsible) */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="bg-blue-600 text-white flex flex-col items-start space-y-2 p-4 md:hidden shadow-lg z-40"
        >
          {user ? (
            <>
              <span
                className="cursor-pointer"
                onClick={() => {
                  navigate("/feeds");
                  setMenuOpen(false);
                }}
              >
                Feeds
              </span>
              <span
                className="cursor-pointer"
                onClick={() => {
                  navigate("/saved-posts");
                  setMenuOpen(false);
                }}
              >
                Saved Posts
              </span>
              <span
                className="cursor-pointer"
                onClick={() => {
                  navigate("/my-posts");
                  setMenuOpen(false);
                }}
              >
                My Posts
              </span>
              <span>{user.displayName || user.email}</span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-500 px-3 py-1 rounded mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              className="bg-green-500 px-3 py-1 rounded mt-2"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
