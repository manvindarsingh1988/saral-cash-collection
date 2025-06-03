import JSZip from "jszip";

export function formatIndianNumber(number: number): string {
  const numStr = (number || "0").toString();
  // If the number is less than 1000, return it as is
  if (numStr.length <= 3) {
    return numStr;
  }

  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return rest ? formatted + "," + lastThree : lastThree;
}

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