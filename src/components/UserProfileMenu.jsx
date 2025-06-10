import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfileMenu({ user, onSignOut, onForgotPassword }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white flex items-center space-x-2 px-3 py-2 text-sm font-medium hover:bg-indigo-700 rounded focus:outline-none"
      >
        <div className="text-left truncate max-w-[100px] sm:max-w-[160px]">
          <div className="font-semibold">{user?.UserName || "User"}</div>
          <div className="text-xs opacity-80">{user?.UserType || "Role"}</div>
        </div>
        <svg
          className="ml-1 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50">
          <button
            onClick={() => {
              setShowMenu(false);
              navigate("/change-password");
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Change Password
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              onSignOut();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
