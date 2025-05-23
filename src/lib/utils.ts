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
  else if (workFlow === 5) rowColor = "bg-green-100";

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
