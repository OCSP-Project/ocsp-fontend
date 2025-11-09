// src/validators/auth.validators.ts
import { isValidEmail, validatePasswordStrength, isEmpty } from '@/utils/validation.utils';

/**
 * Authentication form validators
 */

export interface LoginValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
  };
}

export interface RegisterValidationResult {
  isValid: boolean;
  errors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  };
}

/**
 * Validate login form
 */
export const validateLogin = (data: {
  email: string;
  password: string;
}): LoginValidationResult => {
  const errors: LoginValidationResult['errors'] = {};

  // Validate email
  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate registration form
 */
export const validateRegister = (data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}): RegisterValidationResult => {
  const errors: RegisterValidationResult['errors'] = {};

  // Validate username
  if (isEmpty(data.username)) {
    errors.username = 'Username is required';
  } else if (data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (data.username.length > 30) {
    errors.username = 'Username must not exceed 30 characters';
  }

  // Validate email
  if (isEmpty(data.email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.feedback.join(', ');
    }
  }

  // Validate confirm password
  if (isEmpty(data.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Validate role
  if (isEmpty(data.role)) {
    errors.role = 'Please select a role';
  } else if (!['homeowner', 'contractor', 'supervisor'].includes(data.role)) {
    errors.role = 'Invalid role selected';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate forgot password form
 */
export const validateForgotPassword = (email: string): { isValid: boolean; error?: string } => {
  if (isEmpty(email)) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate reset password form
 */
export const validateResetPassword = (data: {
  password: string;
  confirmPassword: string;
}): { isValid: boolean; errors: { password?: string; confirmPassword?: string } } => {
  const errors: { password?: string; confirmPassword?: string } = {};

  if (isEmpty(data.password)) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.feedback.join(', ');
    }
  }

  if (isEmpty(data.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
