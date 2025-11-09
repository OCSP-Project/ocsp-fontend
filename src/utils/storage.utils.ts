// src/utils/storage.utils.ts

/**
 * localStorage and sessionStorage utilities with type safety
 */

/**
 * Get item from localStorage
 */
export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  if (typeof window === 'undefined') return defaultValue || null;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue || null;
  }
};

/**
 * Set item in localStorage
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

/**
 * Clear all localStorage
 */
export const clearLocalStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Get item from sessionStorage
 */
export const getSessionStorage = <T>(key: string, defaultValue?: T): T | null => {
  if (typeof window === 'undefined') return defaultValue || null;

  try {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return defaultValue || null;
  }
};

/**
 * Set item in sessionStorage
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error);
  }
};

/**
 * Remove item from sessionStorage
 */
export const removeSessionStorage = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
};

/**
 * Clear all sessionStorage
 */
export const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};
