import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiBase } from "../../lib/apiBase";
import UpdateOpeningBalanceModal from "../../components/admin/UpdateOpeningBalanceModal";
import ConnectedCollectorsModal from "../../components/admin/ConnectedCollectorsModal";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatToCustom } from "../../lib/utils";
import ShowPasswordModal from "../../components/admin/ShowPasswordModal";

export default function UserInfo() {
  useDocumentTitle("User Info");

  const [userInfos, setUserInfos] = useState([]);
  const [filteredUserInfos, setFilteredUserInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [pendingModalType, setPendingModalType] = useState(null); // 'main' or 'openingBalance'

  console.log("selectedUserId in UserInfo:", selectedUserId);
  console.log("pendingModalType in UserInfo:", pendingModalType);
  const [filters, setFilters] = useState({
    id: "",
    username: "",
    active: "",
    userType: "",
    balance: "",
    balanceDate: "",
  });

  const userTypeOptions = useMemo(
    () => [
      { Id: 5, Name: "Retailer" },
      { Id: 12, Name: "Collector" },
    ],
    []
  );

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0001-01-01T00:00:00") return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const fetchUserInfos = async () => {
    setLoading(true);
    try {
      const [master, response] = await Promise.all([
        apiBase.getMasterData(),
        apiBase.getUserExtendedInfo(),
      ]);
      setUserInfos(response || []);
      setFilteredUserInfos(response || []);
      setMasterData(master || {});
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = apiBase.getCurrentUser();
    setCurrentUser(user);
    fetchUserInfos();
  }, []);

  useEffect(() => {
    if (selectedUserId && pendingModalType) {
      if (pendingModalType === "main") {
        setShowOpeningBalanceModal(false);
        setShowPasswordDialog(false);
        setShowModal(true);
      } else if (pendingModalType === "openingBalance") {
        setShowModal(false);
        setShowPasswordDialog(false);
        setShowOpeningBalanceModal(true);
      } else if (pendingModalType === "password") {
        setShowModal(false);
        setShowOpeningBalanceModal(false);
        setShowPasswordDialog(true);
      }
      setPendingModalType(null); // Clear pending state
    }
  }, [selectedUserId, pendingModalType]);

  const handleIdClick = (userId) => {
    setSelectedUserId(userId);
    setPendingModalType("main");
  };

  const handleOpeningBalance = (userId) => {
    setSelectedUserId(userId);
    setPendingModalType("openingBalance");
  };

  const handleOpeningBalanceModalClose = (balance, date) => {
    if (balance && date) {
      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === selectedUserId
            ? { ...u, OpeningBalance: balance, OpeningBalanceDate: date }
            : u
        )
      );
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
            userTypeOptions.find((opt) => opt.Name === filters.userType)?.Id) &&
        (filters.balance === "" ||
          String(user.OpeningBalance || "").includes(filters.balance)) &&
        (filters.balanceDate === "" ||
          formatDate(user.OpeningBalanceDate).includes(filters.balanceDate))
      );
    });
    setFilteredUserInfos(filtered);
  }, [filters, userInfos, userTypeOptions]);

  useEffect(() => {
    const timeout = setTimeout(() => applyFilters(), 300);
    return () => clearTimeout(timeout);
  }, [applyFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const updateFlag = async (userId, value, type) => {
    try {
      const updater =
        type === "thirdParty"
          ? apiBase.updateIsThirdPartyFlag
          : apiBase.updateIsSelfSubmitterFlag;

      const result = await updater(userId, value);
      if (!result.Response) throw new Error(result.Message);

      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === userId
            ? {
                ...u,
                [type === "thirdParty" ? "IsThirdParty" : "IsSelfSubmitter"]:
                  value,
              }
            : u
        )
      );
    } catch (error) {
      alert(`Failed to update flag: ${error.message}`);
      console.error(error);
    }
  };

  const handleShowUserPassword = async (userId) => {
    setPendingModalType("password");
    setSelectedUserId(userId);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow border border-gray-200">
      {loading ? (
        <p>Loading user info...</p>
      ) : (
        <div className="max-h-[calc(100vh-150px)] overflow-y-auto overflow-x-auto px-2 sm:px-0">
          <table className="w-full table-auto text-xs sm:text-sm border border-gray-200 rounded-md">
            <thead className="bg-gray-100 text-left">
              <tr>
                {[
                  "Id",
                  "Username",
                  "Active",
                  "User Type",
                  "Opening Balance",
                  "Balance Date",
                  "3rd Party",
                  "Self Submitter",
                  "Actions",
                  "Password",
                ]
                  .filter(
                    (header) =>
                      (header === "Password" &&
                        currentUser?.UserType === "Admin") ||
                      header !== "Password"
                  )
                  .map((header) => (
                    <th
                      key={header}
                      className="p-2 font-semibold whitespace-nowrap"
                    >
                      {header}
                      {[
                        "Id",
                        "Username",
                        "Active",
                        "User Type",
                        "Opening Balance",
                        "Balance Date",
                      ].includes(header) && (
                        <div className="mt-1">
                          {header === "Active" || header === "User Type" ? (
                            <select
                              name={
                                header === "Active"
                                  ? "active"
                                  : header === "User Type"
                                  ? "userType"
                                  : ""
                              }
                              value={
                                header === "Active"
                                  ? filters.active
                                  : filters.userType
                              }
                              onChange={handleFilterChange}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="">All</option>
                              {header === "Active" && (
                                <>
                                  <option value="yes">Yes</option>
                                  <option value="no">No</option>
                                </>
                              )}
                              {header === "User Type" &&
                                userTypeOptions.map((type) => (
                                  <option key={type.Id} value={type.Name}>
                                    {type.Name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              name={
                                header === "Id"
                                  ? "id"
                                  : header === "Username"
                                  ? "username"
                                  : header === "Opening Balance"
                                  ? "balance"
                                  : "balanceDate"
                              }
                              value={
                                header === "Id"
                                  ? filters.id
                                  : header === "Username"
                                  ? filters.username
                                  : header === "Opening Balance"
                                  ? filters.balance
                                  : filters.balanceDate
                              }
                              onChange={handleFilterChange}
                              placeholder="Filter"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {filteredUserInfos.map((user) => (
                <tr
                  key={user.Id}
                  className={`${
                    !user.Active
                      ? "bg-gray-300"
                      : "even:bg-white odd:bg-gray-50"
                  }`}
                >
                  <td
                    className="p-2 font-medium text-blue-600 cursor-pointer"
                    onClick={() => handleIdClick(user.Id)}
                  >
                    {user.Id}
                  </td>
                  <td className="p-2">{user.UserName}</td>
                  <td className="p-2">{user.Active ? "Yes" : "No"}</td>
                  <td className="p-2">
                    {userTypeOptions.find((t) => t.Id === user.UserType)
                      ?.Name || "-"}
                  </td>
                  <td className="p-2">{formatCurrency(user.OpeningBalance)}</td>
                  <td className="p-2">{formatDate(user.OpeningBalanceDate)}</td>
                  <td className="p-2">
                    {user.UserType == 5 ? (
                      <input
                        type="checkbox"
                        checked={user.IsThirdParty}
                        disabled={!user.Active}
                        onChange={(e) =>
                          updateFlag(user.Id, e.target.checked, "thirdParty")
                        }
                      />
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="p-2">
                    {user.UserType == 5 ? (
                      <input
                        type="checkbox"
                        checked={user.IsSelfSubmitter}
                        disabled={!user.Active}
                        onChange={(e) =>
                          updateFlag(user.Id, e.target.checked, "selfSubmitter")
                        }
                      />
                    ) : (
                      ""
                    )}
                  </td>
                  <td className="p-2">
                    {user.Active ? (
                      <button
                        className="text-indigo-600 underline text-xs"
                        onClick={() => handleOpeningBalance(user.Id)}
                      >
                        Edit OB
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  {currentUser?.UserType === "Admin" && (
                    <td className="p-2 relative">
                      <button
                        className="text-blue-600 underline"
                        onClick={() => handleShowUserPassword(user.Id)}
                      >
                        Get Password
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedUserId && (
        <ConnectedCollectorsModal
          selectedUserId={selectedUserId}
          setShowModal={setShowModal}
        />
      )}

      {showOpeningBalanceModal && selectedUserId && (
        <UpdateOpeningBalanceModal
          selectedUserId={selectedUserId}
          handleOpeningBalanceModalClose={handleOpeningBalanceModalClose}
        />
      )}
      {showPasswordDialog && (
        <ShowPasswordModal
          userId={selectedUserId}
          setShowPasswordDialog={setShowPasswordDialog}
        />
      )}
    </div>
  );
}
