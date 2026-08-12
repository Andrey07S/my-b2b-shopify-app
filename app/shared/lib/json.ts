export const parseJsonStringArray = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter(Boolean);
  } catch {
    return [];
  }
};

export const isNonNegativeNumber = (value: number): boolean => {
  return !Number.isNaN(value) && value >= 0;
};
