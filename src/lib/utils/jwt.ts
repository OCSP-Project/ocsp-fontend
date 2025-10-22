// src/lib/utils/jwt.ts

export const getContractorIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.ContractorId || null;
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nameid || payload.sub || null;
  } catch {
    return null;
  }
};
