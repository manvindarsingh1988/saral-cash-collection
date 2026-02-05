import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiBase } from "../../lib/apiBase";
import UpdateOpeningBalanceModal from "../../components/admin/UpdateOpeningBalanceModal";
import UpdateRemarkModal from "../../components/admin/UpdateRemarkModal";
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
  const [showRemarkeModal, setShowRemarkModal] = useState(false);
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
    remark: "",
    isUserLinked: "",
    parentname: ""
  });

  const userTypeOptions = useMemo(
    () => [
      { Id: 5, Name: "Retailer" },
      { Id: 12, Name: "Collector" },
      { Id: 13, Name: "Cashier" },
      { Id: 14, Name: "MasterCashier" },
      { Id: 20, Name: "ZoneManager" },
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
        setShowRemarkModal(false);
        setShowModal(true);
      } else if (pendingModalType === "openingBalance") {
        setShowModal(false);
        setShowPasswordDialog(false);
        setShowRemarkModal(false);
        setShowOpeningBalanceModal(true);
      } else if (pendingModalType === "password") {
        setShowModal(false);
        setShowOpeningBalanceModal(false);
        setShowRemarkModal(false);
        setShowPasswordDialog(true);
      } else if (pendingModalType === "addRemark") {
        setShowModal(false);
        setShowOpeningBalanceModal(false);
        setShowPasswordDialog(false);
        setShowRemarkModal(true);
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

  const handleAddRemark = (userId) => {
    setSelectedUserId(userId);
    setPendingModalType("addRemark");
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

  const handleRemarkeModalClose = (remark) => {
    setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === selectedUserId
            ? { ...u, Remark: remark }
            : u
        )
      );
    setShowRemarkModal(false);
    setSelectedUserId("");
  };

  const applyFilters = useCallback(() => {
  const filtered = userInfos.filter((user) => {
    
    const remark = user.Remark?.toLowerCase() ?? "";
    const mesg = getUnlinkedMessage(user.UserType, user).toLowerCase();
    
    const filterRemark = (filters.remark || "").toLowerCase();
    const userLinked = (filters.isUserLinked || "").toLowerCase();
    return (
      // ID filter
      String(user.Id).toLowerCase().includes(filters.id.toLowerCase()) &&

      // Username filter
      (user.UserName?.toLowerCase() ?? "").includes(filters.username.toLowerCase()) &&
      (user.ParentName?.toLowerCase() ?? "").includes(filters.parentname.toLowerCase()) &&
      // Remark filter
      (filterRemark === "" || remark.includes(filterRemark)) &&

      (userLinked === "" || mesg.includes(userLinked)) &&

      // Active filter
      (filters.active === "" ||
        (filters.active === "yes" && user.Active) ||
        (filters.active === "no" && !user.Active)) &&

      // User type filter
      (filters.userType === "" ||
        user.UserType === userTypeOptions.find((opt) => opt.Name === filters.userType)?.Id) &&

      // Balance filter
      (filters.balance === "" ||
        String(user.OpeningBalance || "").includes(filters.balance)) &&

      // Balance date filter
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

  const getUnlinkedMessage = (userType, linked) => {
    const { LinkedCollectors, LinkedCashiers, LinkedMasterCashiers, IsSelfSubmitter, Active, IsThirdParty, NoBalanceAdded, LedgerCount } = linked;
    if(Active == 0 || IsThirdParty == 1) {
      return '';
    }
    let missing = [];

    if (userType === 5) {
        if (LinkedCollectors === 0 && IsSelfSubmitter != 1) missing.push("Collector");
        if (LinkedCashiers === 0 && IsSelfSubmitter != 1) missing.push("Cashier");
        if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    }

    else if (userType === 12) {
        if (LinkedCashiers === 0) missing.push("Cashier");
        if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    }

    else if (userType === 13) {
        if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    }
    let mes = '';
    if (NoBalanceAdded === 0 && (userType === 5 || userType === 12 || userType === 13)) {
        mes += 'Opening balance is not yet added.'
    }
    if (LedgerCount === 0 && (userType === 5 || userType === 12)) {
        mes += ' No ledger is yet created.'
    }
    // If nothing is missing → return empty string
    if (missing.length === 0) return "";

    return `User is not linked with any ${missing.join(", ")}. ` + mes;
}

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
                  "Parent Name",
                  "Active",
                  "User Type",
                  "Opening Balance",
                  "Balance Date",
                  "3rd Party",
                  "Self Submitter",
                  "Actions",
                  "Password",
                  "Remark",
                  "Is User Linked"
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
                        "Parent Name",
                        "Active",
                        "User Type",
                        "Opening Balance",
                        "Balance Date",
                        "Remark",
                        "Is User Linked"
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
                                  : header === "Parent Name"
                                  ? "parentname"
                                  : header === "Opening Balance"
                                  ? "balance"
                                  : header === "Balance Date"
                                  ? "balanceDate"
                                  : header === "Remark"
                                  ? "remark"
                                  : "isUserLinked"
                              }
                              value={
                                header === "Id"
                                  ? filters.id
                                  : header === "Username"
                                  ? filters.username
                                  : header === "Parent Name"
                                  ? filters.parentname
                                  : header === "Opening Balance"
                                  ? filters.balance
                                  : header === "Balance Date"
                                  ? filters.balanceDate
                                  : header === "Remark"
                                  ? filters.remark
                                  : filters.isUserLinked
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

            <tbody className="text-xs">
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
                  <td className="p-2">{user.ParentName}</td>
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
                      <div className="flex flex-col space-y-1">
                        <button
                          className="text-indigo-600 underline text-xs"
                          onClick={() => handleOpeningBalance(user.Id)}
                        >
                          Edit OB
                        </button>

                        <button
                          className="text-indigo-600 underline text-xs"
                          onClick={() => handleAddRemark(user.Id)}
                        >
                          Add Remark
                        </button>
                      </div>
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
                  <td className="p-2">{user.Remark}</td>
                  <td className="p-2">
                    <span className="text-red-600">
                      {getUnlinkedMessage(user?.UserType, user)}
                    </span>
                  </td>
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
      {showRemarkeModal && selectedUserId && (
        <UpdateRemarkModal
          selectedUserId={selectedUserId}
          handleRemarkModalClose={handleRemarkeModalClose}
        />
      )}
    </div>
  );
}
