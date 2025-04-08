import React, { useState } from "react";
import { apiBase } from "../../lib/apiBase";

export default function AddUser() {
  const [formData, setFormData] = useState({
    userTypeId: "12", // Default to Collector
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
    commission: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

      await apiBase.saveCollectorUser(formData);

      setSuccess(true);
      setFormData({
        userTypeId: "12",
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
        commission: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        Add New User
      </h1>

      <div className="mt-6">
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
              htmlFor="userTypeId"
              className="block text-sm font-medium text-gray-700"
            >
              User Type
            </label>
            <select
              id="userTypeId"
              value={formData.userTypeId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="12">Collector</option>
              <option value="13">Cashier</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
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
              { id: "commission", label: "Commission (%)", type: "number" },
            ].map(({ id, label, type = "text" }) => (
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-1"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
