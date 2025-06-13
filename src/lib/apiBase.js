const API_URL = import.meta.env.VITE_API_ENDPOINT;
const DOC_URL = import.meta.env.VITE_DOC_ENDPOINT;

let currentUser = null;
let accessToken = null;
let tokenExpiry = null;

async function refreshTokenIfNeeded() {
  const bufferTime = 60 * 1000; // 1 minute before expiry
  if (
    accessToken &&
    tokenExpiry &&
    new Date().getTime() > tokenExpiry - bufferTime
  ) {
    const stored = JSON.parse(sessionStorage.getItem("currentUser"));
    if (stored?.refreshToken) {
      const response = await fetch(`${API_URL}/RefreshToken`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        accessToken = data.Token;
        tokenExpiry = new Date(data.Expiry).getTime() * 1000;
        stored.Token = accessToken;
        stored.Expiry = data.Expiry;
        sessionStorage.setItem("currentUser", JSON.stringify(stored));
      } else {
        console.error("Token refresh failed");
      }
    }
  }
}

async function authorizedFetch(url, options = {}) {
  await refreshTokenIfNeeded();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Clear session and throw error
    sessionStorage.removeItem("currentUser");
    accessToken = null;
    tokenExpiry = null;
    currentUser = null;
    window.location.href = "/signin";

    throw new Error("Unauthorized. Please login again.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Request failed with status ${response.status}: ${errorText}`
    );
  }

  return response;
}

export const apiBase = {
  signIn: async (email, password) => {
    const response = await fetch(
      `${API_URL}/Login?userId=${email}&password=${password}`
    );

    const user = await response.json();
    if (!response.ok || user?.IsFailed) {
      console.error(`Failed to login: ${response.statusText}`);
      throw new Error(user?.Message || "Login failed");
    }

    accessToken = user.Token;
    tokenExpiry = new Date(user.Expiry).getTime() * 1000;
    currentUser = user;
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    return { user };
  },

  signOut: async () => {
    accessToken = null;
    tokenExpiry = null;
    currentUser = null;
    sessionStorage.removeItem("currentUser");
  },

  changePassword: async (oldPassword, newPassword) => {
    await (
      await authorizedFetch(`${API_URL}/ChangePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      })
    ).json();
  },

  getCurrentUser: () => {
    if (!currentUser) {
      const stored = sessionStorage.getItem("currentUser");
      if (stored) {
        currentUser = JSON.parse(stored);
        accessToken = currentUser.Token;
        tokenExpiry = new Date().getTime() + currentUser.Expiry * 1000;
      }
    }
    return currentUser;
  },

  getMasterData: async () =>
    await (await authorizedFetch(`${API_URL}/GetMasterData`)).json(),
  getMappedUsersByCollectorId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetMappedUsersByCollectorId?userId=${id}`
      )
    ).json(),
  getRetailUsers: async () =>
    await (await authorizedFetch(`${API_URL}/GetRetailerUsers`)).json(),
  getCollectors: async () =>
    await (await authorizedFetch(`${API_URL}/GetCollectorUsers`)).json(),
  getCashiers: async () =>
    await (await authorizedFetch(`${API_URL}/GetCashierUsers`)).json(),
  getMappedUsers: async () =>
    await (await authorizedFetch(`${API_URL}/GetMappedUsers`)).json(),
  getMappedCollectorsByRetailerId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetMappedCollectorsByRetailerId?userId=${id}`
      )
    ).json(),
  getLiabilityAmountOfAllRetailers: async () =>
    await (
      await authorizedFetch(`${API_URL}/GetLiabilityAmountOfAllRetailers`)
    ).json(),
  getLiabilityAmountOfAllRetailersByCollectorId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLiabilityAmountOfAllRetailersByCollectorId?collectorId=${id}`
      )
    ).json(),
  getLadgerInfosCreatedByCollectors: async (date) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLadgerInfosCreatedByCollectors?date=${date}`
      )
    ).json(),
  getLiabilityAmountByRetailerId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLiabilityAmountByRetailerId?userId=${id}`
      )
    ).json(),
  getLiabilityAmountByCollectorId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLiabilityAmountByCollectorId?userId=${id}`
      )
    ).json(),
  getLiabilityAmountByCashierId: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLiabilityAmountByCashierId?userId=${id}`
      )
    ).json(),
  addLedgerInfo: async (data) =>
    await (
      await authorizedFetch(`${API_URL}/AddLadgerInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json(),
  updateLedgerInfo: async (data) =>
    await (
      await authorizedFetch(`${API_URL}/UpdateLadgerInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json(),
  deleteLedgerInfo: async (id) =>
    await (
      await authorizedFetch(`${API_URL}/DeleteLadgerInfo?id=${id}`, {
        method: "DELETE",
      })
    ).json(),
  getLadgerInfoByRetailerid: async (all, id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLadgerInfoByRetailerid?all=${all}&retailerId=${id}`
      )
    ).json(),
  getLedgerInfoByCollectorId: async (all, id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLadgerInfoByCollectorId?all=${all}&collectorId=${id}`
      )
    ).json(),
  GetLadgerInfoCreatedByCashierId: async (all, id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLadgerInfoCreatedByCashierId?all=${all}&cashierId=${id}`
      )
    ).json(),
  getLadgerInfoByRetaileridAndCollectorId: async (all, rid, cid) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetLadgerInfoByRetaileridAndCollectorId?all=${all}&retailerId=${rid}&collectorId=${cid}`
      )
    ).json(),
  saveUser: async (data) =>
    await (
      await authorizedFetch(`${API_URL}/SaveUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json(),
  alignCollectorWithRetailerUser: async (data) =>
    await (
      await authorizedFetch(`${API_URL}/AlignCollectorWithRetailerUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json(),
  getCollectorLiabilities: async () =>
    await (await authorizedFetch(`${API_URL}/GetCollectorLiabilities`)).json(),
  getCashierLiabilities: async () =>
    await (await authorizedFetch(`${API_URL}/GetCashierLiabilities`)).json(),
  getCollectorLiabilityDetails: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetCollectorLiabilityDetails?cashierId=${id}`
      )
    ).json(),
  getCashierLiabilityDetails: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetCashierLiabilityDetails?cashierId=${id}`
      )
    ).json(),
  getCollectorLedgerDetails: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetCollectorLedgerDetails?collectorId=${id}`
      )
    ).json(),
  getCashierLedgerDetails: async (id) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetCashierLedgerDetails?cashierId=${id}`
      )
    ).json(),
  getPendingApprovals: async (all, type) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetPendingApprovalLedgers?showAll=${all}&userType=${type}`
      )
    ).json(),
  getPendingApprovalsByCollectorId: async (id, all) =>
    await (
      await authorizedFetch(
        `${API_URL}/GetPendingApprovalLedgersByCollectorId?collectorId=${id}&showAll=${all}`
      )
    ).json(),
  getUserExtendedInfo: async () =>
    await (await authorizedFetch(`${API_URL}/GetUserExtendedInfo`)).json(),
  updateIsSelfSubmitterFlag: async (id, flag) =>
    await (
      await authorizedFetch(`${API_URL}/UpdateIsSelfSubmitterFlag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, isSelfSubmitter: flag }),
      })
    ).json(),
  updateIsThirdPartyFlag: async (id, flag) =>
    await (
      await authorizedFetch(`${API_URL}/UpdateIsThirdPartyFlag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, isThirdParty: flag }),
      })
    ).json(),
  getLinkedCollectors: async (id) =>
    await (
      await authorizedFetch(`${API_URL}/GetLinkedCollectors?userId=${id}`)
    ).json(),
  updateOpeningBalanceData: async (id, balance, date) =>
    await (
      await authorizedFetch(`${API_URL}/UpdateOpeningBalanceData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          openingBalance: balance,
          openingBalanceDate: date,
        }),
      })
    ).json(),
  getPassword: async (id) =>
    await (await authorizedFetch(`${API_URL}/GetPassword?userId=${id}`)).json(),
  linkAllRetailersToNewCollector: async (fromId, toId) =>
    await (
      await authorizedFetch(`${API_URL}/LinkAllRetailersToNewCollector`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromCollectorId: fromId, toCollectorId: toId }),
      })
    ).json(),
  deleteLinking: async (cid, rid) =>
    await (
      await authorizedFetch(
        `${API_URL}/DeleteLinking?collectorId=${cid}&retailerId=${rid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectorId: cid, retailerId: rid }),
        }
      )
    ).json(),
  uploadFile: async (file, name) => {
    const response = await authorizedFetch(`${DOC_URL}/UploadCashFlowFile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: file, fileName: name }),
    });
    if (!response.ok) throw new Error("File upload failed");
    return true;
  },
  downloadFileUrl: async (name) =>
    await (
      await authorizedFetch(`${DOC_URL}/DownloadCashFlowFile?fileName=${name}`)
    ).json(),
};
