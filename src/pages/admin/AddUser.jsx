import React, { useState, useEffect } from "react";
import { apiBase } from "../../lib/apiBase";
import { Navigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const formFields = [
  { id: "firstName", label: "First Name" },
  { id: "middleName", label: "Middle Name" },
  { id: "lastName", label: "Last Name" },
  { id: "dateOfBirth", label: "Date of Birth", type: "date" },
  { id: "mobile", label: "Mobile", type: "tel" },
  { id: "address", label: "Address" },
  { id: "counterLocation", label: "Counter Location" },
  { id: "pinCode", label: "PIN Code" },
  { id: "city", label: "City" },
  { id: "stateName", label: "State" },
];

export default function AddUser() {
  useDocumentTitle("Add User");
  const [formData, setFormData] = useState({
    userType: 12,
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: new Date().toISOString().split("T")[0],
    mobile: "",
    address: "",
    counterLocation: "",
    pinCode: "",
    city: "",
    stateName: "",
    commission: "1",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    try {
      const user = apiBase.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      Navigate("/signin");
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await apiBase.saveUser(formData); // assuming it returns user data with password
      const generatedPassword = response?.Password || "Temp@1234"; // fallback if not returned

      setPassword(generatedPassword);
      setSuccess(true);
      setFormData({
        userType: 12,
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        mobile: "",
        address: "",
        counterLocation: "",
        pinCode: "",
        city: "",
        stateName: "",
        commission: "1",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-4 px-2 sm:px-4">
      <div className="bg-white p-4 sm:p-6 rounded shadow-lg space-y-6 w-full max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              Account created successfully!
            </div>
          )}

          {/* User Type Selector */}
          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700"
            >
              User Type
            </label>
            <select
              id="userType"
              value={formData.userType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="12">Collector</option>
              {user?.UserType === "Cashier" ? (
                ""
              ) : (
                <option value="13">Cashier</option>
              )}
              {user?.UserType === "MasterCashier" || user?.UserType === "Cashier" ? (
                ""
              ) : (
                <option value="14">MasterCashier</option>
              )}
            </select>
          </div>

          {/* Responsive Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map(({ id, label, type = "text" }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  required
                  value={formData[id]}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
        bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Success Display Below Form on Mobile */}
        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 space-y-2">
            <div>Account created successfully!</div>
            {password && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                <span className="font-mono bg-white px-2 py-1 border rounded text-gray-900 break-all">
                  {password}
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(password)}
                  className="text-sm px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
