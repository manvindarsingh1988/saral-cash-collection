import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiBase } from "../../lib/apiBase";
import UpdateOpeningBalanceModal from "../../components/admin/UpdateOpeningBalanceModal";
import ConnectedCollectorsModal from "../../components/admin/ConnectedCollectorsModal";

export default function UserInfo() {
  const [userInfos, setUserInfos] = useState([]);
  const [filteredUserInfos, setFilteredUserInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);

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

  const handleIdClick = (userId) => {
    setSelectedUserId(userId);
    setShowOpeningBalanceModal(false);
    setShowModal(true);
  };

  const handleOpeningBalance = (userId, currentOpeningBalance) => {
    setSelectedUserId(userId);
    setShowModal(false);
    setShowOpeningBalanceModal(true);
  };

  const handleOpeningBalanceModalClose = (openingBalance, date) => {
    if (openingBalance && date) {
      const user = userInfos.find((user) => user.Id === selectedUserId);
      if (user) {
        setUserInfos((prev) =>
          prev.map((u) =>
            u.Id === selectedUserId
              ? {
                  ...u,
                  OpeningBalance: openingBalance,
                  OpeningBalanceDate: date,
                }
              : u
          )
        );
      }
    }

    setShowOpeningBalanceModal(false);
    setSelectedUserId("");
  };

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
    const timeout = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timeout);
  }, [applyFilters]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
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
    try {
      const result = await apiBase.updateIsThirdPartyFlag(userId, isChecked);
      if (!result.Response) {
        alert(
          `Failed to update 'Is Third Party' for user ${userId}: ${result.Message}`
        );
        return;
      }

      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === userId ? { ...u, IsThirdParty: isChecked } : u
        )
      );
    } catch (error) {
      alert(
        `Failed to update 'Is Third Party' for user ${userId}: ${error.message}`
      );
      console.error(error);
    }
  };

  const handleIsSelfSubmitterChange = async (e, userId) => {
    const isChecked = e.target.checked;
    try {
      const result = await apiBase.updateIsSelfSubmitterFlag(userId, isChecked);
      if (!result.Response) {
        alert(
          `Failed to update 'Is Self Submitter' for user ${userId}: ${result.Message}`
        );
        return;
      }

      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === userId ? { ...u, IsSelfSubmitter: isChecked } : u
        )
      );
    } catch (error) {
      alert(
        `Failed to update 'Is Self Submitter' for user ${userId}: ${error.message}`
      );
      console.error(error);
    }
  };

  const userTypeOptions = useMemo(
    () => [
      { Id: 5, Name: "Retailer" },
      { Id: 12, Name: "Collector" },
    ],
    []
  );

  return (
    <div
      className="rounded-lg shadow-lg border border-gray-200"
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
                <th></th>
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
                    <td
                      style={{
                        padding: "8px 12px",
                        cursor: user.UserType === 5 ? "pointer" : "default",
                        color: user.UserType === 5 ? "#007bff" : "inherit",
                      }}
                      onClick={
                        user.UserType === 5
                          ? () => handleIdClick(user.Id)
                          : undefined
                      }
                      title={
                        user.UserType === 5
                          ? "Click to view connected collectors"
                          : ""
                      }
                    >
                      {user.Id}
                    </td>

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
                    <td>
                      {user.UserType == 5 && user.Active ? (
                        <button
                          onClick={() =>
                            handleOpeningBalance(user.Id, user.OpeningBalance)
                          }
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Update opening balance
                        </button>
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
      {showModal && selectedUserId && (
        <ConnectedCollectorsModal
          setShowModal={setShowModal}
          selectedUserId={selectedUserId}
        />
      )}
      {showOpeningBalanceModal && selectedUserId && (
        <UpdateOpeningBalanceModal
          handleOpeningBalanceModalClose={handleOpeningBalanceModalClose}
          selectedUserId={selectedUserId}
        />
      )}
    </div>
  );
}
