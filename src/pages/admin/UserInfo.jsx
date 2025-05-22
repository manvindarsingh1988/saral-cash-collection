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
        String(user.UserType || "")
          .toLowerCase()
          .includes(filters.userType.toLowerCase()) &&
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

  return (
    <div
      style={{ padding: "1rem", borderRadius: "8px", background: "#f8f9fa" }}
    >
      {loading ? (
        <p style={{ marginTop: "1rem" }}>Loading user info...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <thead style={{ backgroundColor: "#f1f3f5", textAlign: "left" }}>
              <tr>
                {[
                  "Id",
                  "Username",
                  "Active",
                  "User Type",
                  "Opening Balance",
                  "Opening Balance Date",
                  "Is Third Party",
                  "Is Self Submitter",
                ].map((header, index) => (
                  <th
                    key={index}
                    style={{ padding: "8px 12px", fontWeight: 600 }}
                  >
                    {header}
                    {index < 6 && (
                      <div style={{ marginTop: 4 }}>
                        <input
                          type="text"
                          name={
                            [
                              "id",
                              "username",
                              "active",
                              "userType",
                              "balance",
                              "balanceDate",
                            ][index]
                          }
                          value={
                            filters[
                              [
                                "id",
                                "username",
                                "active",
                                "userType",
                                "balance",
                                "balanceDate",
                              ][index]
                            ]
                          }
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
                    )}
                  </th>
                ))}
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
                  <tr key={user.Id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 12px" }}>{user.Id}</td>
                    <td style={{ padding: "8px 12px" }}>{user.UserName}</td>
                    <td style={{ padding: "8px 12px" }}>
                      {user.Active ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: "8px 12px" }}>{user.UserType}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      {formatCurrency(user.OpeningBalance)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {formatDate(user.OpeningBalanceDate)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="checkbox"
                        checked={user.IsThirdParty}
                        readOnly
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="checkbox"
                        checked={user.IsSelfSubmitter}
                        readOnly
                      />
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
