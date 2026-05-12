// src/common/utils/validators.ts

/**
 * Central validation utilities
 * - Pure functions only
 * - No side effects
 * - Reusable across services, DTO helpers, etc.
 */

/* ---------------------------------- */
/* EMAIL VALIDATION */
/* ---------------------------------- */

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  const value = email.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(value);
};

/* ---------------------------------- */
/* PHONE VALIDATION */
/* ---------------------------------- */

/**
 * Validates Nigerian + international phone numbers
 * Supports:
 * - 08012345678
 * - +2348012345678
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;

  const cleaned = phone.replace(/\s+/g, '');

  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;

  return phoneRegex.test(cleaned);
};

/* ---------------------------------- */
/* PASSWORD VALIDATION */
/* ---------------------------------- */

/**
 * Enforces strong password rules
 * - Min 8 chars
 * - At least 1 uppercase
 * - At least 1 lowercase
 * - At least 1 number
 */
export const isStrongPassword = (password: string): boolean => {
  if (!password) return false;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  return passwordRegex.test(password);
};

/* ---------------------------------- */
/* STRING HELPERS */
/* ---------------------------------- */

/**
 * Checks if string is empty or just whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Basic name validation (no numbers/special chars)
 */
export const isValidName = (name: string): boolean => {
  if (!name) return false;

  const nameRegex = /^[a-zA-Z\s'-]+$/;

  return nameRegex.test(name.trim());
};
