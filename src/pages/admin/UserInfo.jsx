import React, { useCallback, useEffect, useMemo, useState } from "react";
import ConnectedCollectorsModal from "../../components/admin/ConnectedCollectorsModal";
import ShowPasswordModal from "../../components/admin/ShowPasswordModal";
import Tooltip from "../../components/Tooltip";
import UpdateOpeningBalanceModal from "../../components/admin/UpdateOpeningBalanceModal";
import UpdateProjectionSnapshotMinutesModal from "../../components/admin/UpdateProjectionSnapshotMinutesModal";
import UpdateRemarkModal from "../../components/admin/UpdateRemarkModal";
import TruncatedCell from "../../components/TruncatedCell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { apiBase } from "../../lib/apiBase";
import { sortTableRows } from "../../lib/tableSort";

const columns = [
  { key: "Id", label: "ID", width: "110px", filter: "id", type: "text" },
  { key: "UserName", label: "Username", width: "260px", filter: "username", type: "text" },
  { key: "ParentName", label: "Parent Name", width: "260px", filter: "parentname", type: "text" },
  { key: "Active", label: "Active", width: "90px", filter: "active", type: "select" },
  { key: "UserType", label: "User Type", width: "130px", filter: "userType", type: "select" },
  { key: "OpeningBalance", label: "Opening Balance", width: "150px", filter: "balance", type: "text" },
  { key: "OpeningBalanceDate", label: "Balance Date", width: "130px", filter: "balanceDate", type: "text" },
  { key: "ProjectionSnapshotMinutes", label: "Projection Snapshot Minutes", width: "200px" },
  { key: "IsThirdParty", label: "3rd Party", width: "100px" },
  { key: "IsSelfSubmitter", label: "Self Submitter", width: "130px" },
  { key: "Actions", label: "Actions", width: "120px" },
  { key: "Password", label: "Password", width: "120px" },
  { key: "Remark", label: "Remark", width: "160px", filter: "remark", type: "text" },
  { key: "IsUserLinked", label: "Is User Linked", width: "240px", filter: "isUserLinked", type: "text" },
];

export default function UserInfo() {
  useDocumentTitle("User Info");

  const [userInfos, setUserInfos] = useState([]);
  const [filteredUserInfos, setFilteredUserInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [showRemarkeModal, setShowRemarkModal] = useState(false);
  const [showProjectionSnapshotMinutesModal, setShowProjectionSnapshotMinutesModal] = useState(false);
  const [pendingModalType, setPendingModalType] = useState(null);
  const [selectedProjectionSnapshotMinutes, setSelectedProjectionSnapshotMinutes] = useState(null);

  const [filters, setFilters] = useState({
    id: "",
    username: "",
    active: "",
    userType: "",
    balance: "",
    balanceDate: "",
    remark: "",
    isUserLinked: "",
    parentname: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  const visibleColumns = useMemo(
    () =>
      columns.filter(
        (column) =>
          (column.key === "Password" && currentUser?.UserType === "Admin") ||
          column.key !== "Password"
      ),
    [currentUser?.UserType]
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
      const response = await apiBase.getUserExtendedInfo();
      setUserInfos(response || []);
      setFilteredUserInfos(response || []);
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
      setShowModal(pendingModalType === "main");
      setShowOpeningBalanceModal(pendingModalType === "openingBalance");
      setShowPasswordDialog(pendingModalType === "password");
      setShowRemarkModal(pendingModalType === "addRemark");
      setShowProjectionSnapshotMinutesModal(
        pendingModalType === "projectionSnapshotMinutes"
      );
      setPendingModalType(null);
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

  const handleProjectionSnapshotMinutes = (userId, minutes) => {
    setSelectedUserId(userId);
    setSelectedProjectionSnapshotMinutes(minutes ?? null);
    setPendingModalType("projectionSnapshotMinutes");
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
    if (remark !== null && remark !== undefined) {
      setUserInfos((prev) =>
        prev.map((u) => (u.Id === selectedUserId ? { ...u, Remark: remark } : u))
      );
    }
    setShowRemarkModal(false);
    setSelectedUserId("");
  };

  const handleProjectionSnapshotMinutesModalClose = (minutes) => {
    if (minutes !== undefined) {
      setUserInfos((prev) =>
        prev.map((u) =>
          u.Id === selectedUserId
            ? { ...u, ProjectionSnapshotMinutes: minutes }
            : u
        )
      );
    }
    setShowProjectionSnapshotMinutesModal(false);
    setSelectedProjectionSnapshotMinutes(null);
    setSelectedUserId("");
  };

  const getUnlinkedMessage = (userType, linked) => {
    const {
      LinkedCollectors,
      LinkedCashiers,
      LinkedMasterCashiers,
      IsSelfSubmitter,
      Active,
      IsThirdParty,
      NoBalanceAdded,
      LedgerCount,
    } = linked;

    if (Active == 0 || IsThirdParty == 1) {
      return "";
    }

    const missing = [];

    if (userType === 5) {
      if (LinkedCollectors === 0 && IsSelfSubmitter != 1) missing.push("Collector");
      if (LinkedCashiers === 0 && IsSelfSubmitter != 1) missing.push("Cashier");
      if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    } else if (userType === 12) {
      if (LinkedCashiers === 0) missing.push("Cashier");
      if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    } else if (userType === 13) {
      if (LinkedMasterCashiers === 0) missing.push("Master Cashier");
    }

    const messageParts = [];
    if (NoBalanceAdded === 0 && (userType === 5 || userType === 12 || userType === 13)) {
      messageParts.push("Opening balance is not yet added.");
    }
    if (LedgerCount === 0 && (userType === 5 || userType === 12)) {
      messageParts.push("No ledger is yet created.");
    }
    if (missing.length === 0) return "";

    return [
      `User is not linked with any ${missing.join(", ")}.`,
      ...messageParts,
    ].join("\n");
  };

  const applyFilters = useCallback(() => {
    const filtered = userInfos.filter((user) => {
      const remark = user.Remark?.toLowerCase() ?? "";
      const message = getUnlinkedMessage(user.UserType, user).toLowerCase();
      const filterRemark = (filters.remark || "").toLowerCase();
      const userLinked = (filters.isUserLinked || "").toLowerCase();

      return (
        String(user.Id).toLowerCase().includes(filters.id.toLowerCase()) &&
        (user.UserName?.toLowerCase() ?? "").includes(filters.username.toLowerCase()) &&
        (user.ParentName?.toLowerCase() ?? "").includes(filters.parentname.toLowerCase()) &&
        (filterRemark === "" || remark.includes(filterRemark)) &&
        (userLinked === "" || message.includes(userLinked)) &&
        (filters.active === "" ||
          (filters.active === "yes" && user.Active) ||
          (filters.active === "no" && !user.Active)) &&
        (filters.userType === "" ||
          user.UserType === userTypeOptions.find((opt) => opt.Name === filters.userType)?.Id) &&
        (filters.balance === "" || String(user.OpeningBalance || "").includes(filters.balance)) &&
        (filters.balanceDate === "" || formatDate(user.OpeningBalanceDate).includes(filters.balanceDate))
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

  const onSort = (key) => {
    if (key === "Actions" || key === "Password") return;
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
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
                [type === "thirdParty" ? "IsThirdParty" : "IsSelfSubmitter"]: value,
              }
            : u
        )
      );
    } catch (error) {
      alert(`Failed to update flag: ${error.message}`);
      console.error(error);
    }
  };

  const handleShowUserPassword = (userId) => {
    setPendingModalType("password");
    setSelectedUserId(userId);
  };

  const sortedUserInfos = useMemo(
    () =>
      sortTableRows(filteredUserInfos, sortConfig, (user, key) => {
        if (key === "OpeningBalanceDate") return formatDate(user.OpeningBalanceDate);
        if (key === "OpeningBalance") return user.OpeningBalance;
        if (key === "UserType") {
          return userTypeOptions.find((t) => t.Id === user.UserType)?.Name || "";
        }
        if (key === "IsUserLinked") return getUnlinkedMessage(user?.UserType, user);
        return user[key];
      }),
    [filteredUserInfos, formatDate, sortConfig, userTypeOptions]
  );

  const renderFilter = (column) => {
    if (!column.filter) return null;

    if (column.type === "select") {
      const isActive = column.filter === "active";
      return (
        <select
          name={column.filter}
          value={filters[column.filter]}
          onChange={handleFilterChange}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="">All</option>
          {isActive ? (
            <>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </>
          ) : (
            userTypeOptions.map((type) => (
              <option key={type.Id} value={type.Name}>
                {type.Name}
              </option>
            ))
          )}
        </select>
      );
    }

    return (
      <input
        type="text"
        name={column.filter}
        value={filters[column.filter]}
        onChange={handleFilterChange}
        placeholder="Filter"
        className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {loading ? (
        <div className="rounded-lg bg-white p-4 shadow">Loading user info...</div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg bg-white p-4 shadow sm:p-6">
          <div className="app-table-shell min-h-0 flex-1 overflow-auto">
            <table className="app-table min-w-full table-auto text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-left">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-2 font-semibold whitespace-nowrap"
                      style={{
                        width: column.width,
                        minWidth: column.width,
                        maxWidth: column.width,
                      }}
                    >
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className="flex items-center gap-1 text-left"
                        >
                          <span>{column.label}</span>
                          <span className="text-[10px] text-slate-400">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "▲"
                                : "▼"
                              : "↕"}
                          </span>
                        </button>
                      </th>
                  ))}
                </tr>
                <tr className="bg-white">
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2"
                      style={{
                        width: column.width,
                        minWidth: column.width,
                        maxWidth: column.width,
                      }}
                    >
                      {renderFilter(column)}
                    </td>
                  ))}
                </tr>
              </thead>

              <tbody className="text-xs">
                {sortedUserInfos.map((user) => {
                  const isInactive = !user.Active;
                  const inactiveCellStyle = isInactive
                    ? { backgroundColor: "#d1d5db", color: "#475569" }
                    : undefined;
                  const userTypeLabel =
                    userTypeOptions.find((t) => t.Id === user.UserType)?.Name || "-";
                  const unlinkedMessage = getUnlinkedMessage(user?.UserType, user);

                  return (
                    <tr key={user.Id}>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <Tooltip content={String(user.Id)} className="block w-full">
                          <button
                            className={`w-full text-left font-medium ${
                              user.Active ? "text-blue-600" : "text-slate-500"
                            }`}
                            onClick={() => handleIdClick(user.Id)}
                          >
                            <TruncatedCell>{user.Id}</TruncatedCell>
                          </button>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{user.UserName || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{user.ParentName || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{user.Active ? "Yes" : "No"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{userTypeLabel}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{formatCurrency(user.OpeningBalance)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{formatDate(user.OpeningBalanceDate)}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{user.ProjectionSnapshotMinutes ?? "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        {user.UserType == 5 ? (
                          <input
                            type="checkbox"
                            checked={user.IsThirdParty}
                            disabled={!user.Active}
                            onChange={(e) => updateFlag(user.Id, e.target.checked, "thirdParty")}
                          />
                        ) : null}
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        {user.UserType == 5 ? (
                          <input
                            type="checkbox"
                            checked={user.IsSelfSubmitter}
                            disabled={!user.Active}
                            onChange={(e) => updateFlag(user.Id, e.target.checked, "selfSubmitter")}
                          />
                        ) : null}
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        {user.Active ? (
                          <div className="flex flex-col gap-1">
                            <button
                              className="text-left text-xs text-indigo-600 underline"
                              onClick={() => handleOpeningBalance(user.Id)}
                            >
                              Edit OB
                            </button>
                            <button
                              className="text-left text-xs text-indigo-600 underline"
                              onClick={() => handleAddRemark(user.Id)}
                            >
                              Add Remark
                            </button>
                            <button
                              className="text-left text-xs text-indigo-600 underline"
                              onClick={() =>
                                handleProjectionSnapshotMinutes(
                                  user.Id,
                                  user.ProjectionSnapshotMinutes
                                )
                              }
                            >
                              Set Minutes
                            </button>
                          </div>
                        ) : null}
                      </td>

                      {currentUser?.UserType === "Admin" && (
                        <td className="px-4 py-3" style={inactiveCellStyle}>
                          <button
                            className={user.Active ? "text-blue-600 underline" : "text-slate-500 underline"}
                            onClick={() => handleShowUserPassword(user.Id)}
                          >
                            Get Password
                          </button>
                        </td>
                      )}

                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <TruncatedCell>{user.Remark || "-"}</TruncatedCell>
                      </td>
                      <td className="px-4 py-3" style={inactiveCellStyle}>
                        <Tooltip content={unlinkedMessage} className="block max-w-full">
                          <div className="max-w-full whitespace-pre-line break-words text-red-600">
                            {unlinkedMessage || "-"}
                          </div>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

      {showProjectionSnapshotMinutesModal && selectedUserId && (
        <UpdateProjectionSnapshotMinutesModal
          selectedUserId={selectedUserId}
          initialMinutes={selectedProjectionSnapshotMinutes}
          handleProjectionSnapshotMinutesModalClose={
            handleProjectionSnapshotMinutesModalClose
          }
        />
      )}
    </div>
  );
}
