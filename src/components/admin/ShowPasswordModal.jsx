import React, { useEffect, useState } from "react";
import { Eye, EyeOff, ClipboardCopy } from "lucide-react";
import { apiBase } from "../../lib/apiBase";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-80 p-4">
        <h2 className="text-lg font-semibold mb-2">User {userId} Password</h2>
        <div className="flex items-center border rounded px-2 py-1">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            className="font-mono text-sm w-full outline-none bg-transparent"
          />
          <button
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(password)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            title="Copy password"
          >
            <ClipboardCopy size={20} />
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowPasswordDialog(false)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowPasswordModal;
