import JSZip from "jszip";
import { apiBase } from "./apiBase";

export const getLoginId = () => {
  const user = apiBase.getCurrentUser()?.UserName;
  if (user) {
    const match = user.match(/\((\d{10})\)/);
    const loginId = match ? match[1] : null;

    return loginId;
  }

  return null;
};

export const formatIndianNumber = (number) => {
  if (isNaN(number)) return "0";

  // Round to 2 decimal places and split
  const [integerPart, decimalPart] = Number(number)
    .toFixed(2)
    .split(".");

  // Handle Indian number formatting for the integer part
  if (integerPart.length <= 3) {
    return `${integerPart}.${decimalPart}`;
  }

  const lastThree = integerPart.slice(-3);
  const rest = integerPart.slice(0, -3);
  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  const formattedNumber = formattedRest
    ? `${formattedRest},${lastThree}`
    : lastThree;

  return `${formattedNumber}.${decimalPart}`;
};

export function getRowColor(workFlow: number): string {
  let rowColor = "";
  if (workFlow === 1) rowColor = "bg-blue-100";
  else if (workFlow === 2 || workFlow === 4) rowColor = "bg-red-100";
  else if (workFlow === 5 || workFlow === 3) rowColor = "bg-green-100";
  else if (workFlow === 6) rowColor = "bg-yellow-100";

  return rowColor;
}

export function formatToCustomDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ""; // Invalid date check

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`
  );
}

export function formatToCustom(isoString: string): string {
  if (isoString === "0001-01-01T00:00:00") return "";

  const date = new Date(isoString);
  const pad = (num: number) => String(num).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()}`;
}

export function generateSafeGuid(): string {
  const template = "10000000-1000-4000-8000-100000000000";
  return template.replace(/[018]/g, (c) => {
    const rnd = crypto.getRandomValues(new Uint8Array(1))[0];
    const value = Number(c) ^ (rnd & (15 >> (Number(c) / 4)));
    return value.toString(16);
  });
}

export async function zipFileAndGetBytes(file: File): Promise<Uint8Array> {
  const zip = new JSZip();
  const arrayBuffer = await file.arrayBuffer();
  zip.file(file.name, arrayBuffer);
  return await zip.generateAsync({ type: "uint8array" });
}

export async function zipFileAndGetBase64(file: File): Promise<string> {
  const zip = new JSZip();
  const arrayBuffer = await file.arrayBuffer();
  zip.file(file.name, arrayBuffer);
  const base64 = await zip.generateAsync({ type: "base64" });
  return base64;
}

export function base64ToByteArray(base64: string): Uint8Array {
  const binaryString = atob(base64); // Decode base64 to binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

export const handleDownloadFile = async (docId: string, ledgerId: string) => {
  try {
    const response = await apiBase.downloadFileUrl(docId);
    if (!response || !response.content) {
      alert("No file found for this entry.");
      return;
    }

    const fileBytes = base64ToByteArray(response.content);
    const blob = new Blob([fileBytes], {
      type: "application/zip",
    });
    const url = URL.createObjectURL(blob);

    // Create an anchor tag to trigger download with custom filename
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ledger_${ledgerId}.zip`; // Use transactionId as filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
  } catch (err) {
    console.error("File download failed:", err);
  }
};

export const transformAssertion = (credential: any) => ({
  id: credential.id,
  rawId: bufferEncode(credential.rawId),
  type: credential.type,
  response: {
    authenticatorData: bufferEncode(credential.response.authenticatorData),
    clientDataJSON: bufferEncode(credential.response.clientDataJSON),
    signature: bufferEncode(credential.response.signature),
    userHandle: credential.response.userHandle
      ? bufferEncode(credential.response.userHandle)
      : null,
  },
  extensions: credential.getClientExtensionResults(),
});

export const transformAttestation = (credential: any) => ({
  id: bufferEncode(credential.rawId),
  rawId: bufferEncode(credential.rawId),
  type: credential.type,
  response: {
    attestationObject: bufferEncode(credential.response.attestationObject),
    clientDataJSON: bufferEncode(credential.response.clientDataJSON),
  },
  extensions: credential.getClientExtensionResults(),
});

export const bufferDecode = (value: string) => {
  // Convert from Base64URL to regular Base64
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '=' if needed
  const padLength = (4 - (value.length % 4)) % 4;
  value += "=".repeat(padLength);

  const binary = atob(value);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
};

export const bufferEncode = (value: any) => {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const transformToAuthenticatorAttestationRawResponse = (
  credential: any
) => {
  return {
    id: bufferEncode(credential.rawId), // maps to byte[] Id
    rawId: bufferEncode(credential.rawId), // maps to byte[] RawId
    type: credential.type, // maps to PublicKeyCredentialType
    response: {
      attestationObject: bufferEncode(credential.response.attestationObject), // byte[]
      clientDataJSON: bufferEncode(credential.response.clientDataJSON), // byte[]
    },
    extensions: credential.getClientExtensionResults(), // maps to AuthenticationExtensionsClientOutputs
  };
};
