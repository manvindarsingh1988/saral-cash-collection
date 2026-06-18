import React, { useEffect, useState } from "react";
import { Eye, EyeOff, ClipboardCopy, X } from "lucide-react";
import { apiBase } from "../../lib/apiBase";
import TooltipIconButton from "../TooltipIconButton";

const ShowPasswordModal = ({ userId, setShowPasswordDialog }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserPassword(userId);
    }
  }, [userId]);

  const fetchUserPassword = async (userId) => {
    try {
      const response = await apiBase.getPassword(userId);
      if (response.Response) {
        setPassword(response.Response);
      } else {
        alert(`Failed to fetch password: ${response.Message}`);
      }
    } catch (error) {
      alert(`Error fetching password: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal app-modal-sm max-w-sm">
        <div className="app-modal-header">
          <div>
            <h2 className="app-modal-title">User Password</h2>
            <p className="app-modal-subtitle">User ID: {userId}</p>
          </div>
          <button
            onClick={() => setShowPasswordDialog(false)}
            className="app-modal-close"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="app-modal-body">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            className="font-mono text-sm w-full outline-none bg-transparent"
          />
          <TooltipIconButton
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </TooltipIconButton>
          <TooltipIconButton
            onClick={() => navigator.clipboard.writeText(password)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            label="Copy password"
          >
            <ClipboardCopy size={20} />
          </TooltipIconButton>
        </div>
        </div>
        <div className="app-modal-actions">
          <button
            onClick={() => setShowPasswordDialog(false)}
            className="app-button-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowPasswordModal;
