import React, { useEffect, useState, useCallback } from "react";
import { apiBase } from "../../lib/apiBase";

export default function UserInfo() {
  const [userInfos, setUserInfos] = useState([]);
  const [filteredUserInfos, setFilteredUserInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({});

  const [filters, setFilters] = useState({
    id: "",
    username: "",
    active: "",
    userType: "",
    balance: "",
    balanceDate: "",
  });

  const fetchUserInfos = async () => {
    setLoading(true);
    try {
      const [master, response] = await Promise.all([
        apiBase.getMasterData(),
        apiBase.getUserExtendedInfo(),
      ]);
      setUserInfos(response || []);
      setMasterData(master || {});
      setFilteredUserInfos(response || []);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfos();
  }, []);

  const applyFilters = useCallback(() => {
    const filtered = userInfos.filter((user) => {
      return (
        String(user.Id).toLowerCase().includes(filters.id.toLowerCase()) &&
        user.UserName?.toLowerCase().includes(filters.username.toLowerCase()) &&
        (filters.active === "" ||
          (filters.active === "yes" && user.Active) ||
          (filters.active === "no" && !user.Active)) &&
        (filters.userType === "" ||
          user.UserType ===
            userTypeOptions.find((option) => option.Name === filters.userType)
              ?.Id) &&
        (filters.balance === "" ||
          String(user.OpeningBalance || "").includes(filters.balance)) &&
        (filters.balanceDate === "" ||
          formatDate(user.OpeningBalanceDate).includes(filters.balanceDate))
      );
    });

    setFilteredUserInfos(filtered);
  }, [filters, userInfos]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIsThirdPartyChange = async (e, userId) => {
    const isChecked = e.target.checked;
    const user = userInfos.find((user) => user.Id === userId);
    if (user) {
      user.IsThirdParty = isChecked;
      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === userId ? { ...u, IsThirdParty: isChecked } : u
        )
      );
    }

    console.log(isChecked, userId);
  };

  const handleIsSelfSubmitterChange = async (e, userId) => {
    const isChecked = e.target.checked;
    const user = userInfos.find((user) => user.Id === userId);
    if (user) {
      user.IsSelfSubmitter = isChecked;
      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === userId ? { ...u, IsSelfSubmitter: isChecked } : u
        )
      );
    }
    
    console.log(isChecked, userId);
  };

  const userTypeOptions = [
    { Id: 5, Name: "Retailer" },
    { Id: 12, Name: "Collector" },
  ];

  return (
    <div
      style={{ padding: "1rem", borderRadius: "8px", background: "#f8f9fa" }}
    >
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Loading user info...</p>
      ) : (
        <div style={{ overflowX: "none" }}>
          <table className="min-w-full divide-y border border-gray-200 rounded-lg text-xs">
            <thead style={{ textAlign: "left" }}>
              <tr>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Id
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      name="id"
                      value={filters.id}
                      onChange={handleFilterChange}
                      placeholder="Filter"
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Username
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      name="username"
                      value={filters.username}
                      onChange={handleFilterChange}
                      placeholder="Filter"
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Active
                  <div style={{ marginTop: 4 }}>
                    <select
                      name="active"
                      value={filters.active}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    >
                      <option value="">All</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  User Type
                  <div style={{ marginTop: 4 }}>
                    <select
                      name="userType"
                      value={filters.userType}
                      onChange={handleFilterChange}
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    >
                      <option value="">All</option>
                      {userTypeOptions.map((type) => (
                        <option key={type.Id} value={type.Name}>
                          {type.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Opening Balance
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      name="balance"
                      value={filters.balance}
                      onChange={handleFilterChange}
                      placeholder="Filter"
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Opening Balance Date
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      name="balanceDate"
                      value={filters.balanceDate}
                      onChange={handleFilterChange}
                      placeholder="dd/mm/yyyy"
                      style={{
                        width: "100%",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                    />
                  </div>
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Is Third Party
                </th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Is Self Submitter
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUserInfos.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    No matching records.
                  </td>
                </tr>
              ) : (
                filteredUserInfos.map((user) => (
                  <tr
                    key={user.Id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: user.Active ? "white" : "#f1f1f1",
                      color: user.Active ? "inherit" : "#888",
                    }}
                  >
                    <td style={{ padding: "8px 12px" }}>{user.Id}</td>
                    <td style={{ padding: "8px 12px" }}>{user.UserName}</td>
                    <td style={{ padding: "8px 12px" }}>
                      {user.Active ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {userTypeOptions.find((_) => _.Id == user.UserType)?.Name}
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      {formatCurrency(user.OpeningBalance)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {formatDate(user.OpeningBalanceDate)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {user.UserType == 5 ? (
                        <input
                          type="checkbox"
                          checked={user.IsThirdParty}
                          disabled={!user.Active}
                          onChange={(e) => handleIsThirdPartyChange(e, user.Id)}
                        />
                      ) : (
                        ""
                      )}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {user.UserType == 5 ? (
                        <input
                          type="checkbox"
                          checked={user.IsSelfSubmitter}
                          disabled={!user.Active}
                          onChange={(e) =>
                            handleIsSelfSubmitterChange(e, user.Id)
                          }
                        />
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
