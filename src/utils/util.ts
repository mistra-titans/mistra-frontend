export function generateRandoms(length: number=14): string {
  if (length <= 0) throw new Error("Length must be positive");

  const timePart = Date.now().toString(); 
  const randomPart = Math.floor(Math.random() * 1e16)
    .toString()
    .padStart(length, "0");

  
  const combined = (timePart + randomPart).slice(0, length);
  return combined.padEnd(length, Math.floor(Math.random() * 10).toString());
}
