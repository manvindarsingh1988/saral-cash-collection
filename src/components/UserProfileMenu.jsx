import React, { useState } from "react";

export default function UserProfileMenu({ user, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-white flex items-center space-x-2 px-3 py-2 text-sm font-medium hover:bg-indigo-700 rounded"
      >
        <div className="text-left">
          <div className="font-semibold truncate max-w sm:max-w">
            {user?.UserName || "User"}
          </div>
          <div className="text-xs opacity-80 truncate max-w sm:max-w">
            {user?.UserType || "Role"}
          </div>
        </div>
        <svg
          className="w-4 h-4 ml-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 min-w-[180px] bg-white rounded-md shadow-lg z-50">
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
