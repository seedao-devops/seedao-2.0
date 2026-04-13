export function normalizePhone(input: string): string {
  let cleaned = input.replace(/[\s\-\(\)]/g, "");

  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    cleaned = "+86" + cleaned;
  }

  return cleaned;
}

export function isValidPhone(phone: string): boolean {
  return /^\+\d{10,15}$/.test(phone);
}
