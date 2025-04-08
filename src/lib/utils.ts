export function formatIndianNumber(number: number): string {
  const numStr = number.toString();
  // If the number is less than 1000, return it as is
  if (numStr.length <= 3) {
    return numStr;
  }

  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return rest ? formatted + "," + lastThree : lastThree;
}
