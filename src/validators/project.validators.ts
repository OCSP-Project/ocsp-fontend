// src/validators/project.validators.ts
import { isEmpty, isValidDateRange } from '@/utils/validation.utils';

/**
 * Project form validators
 */

export interface ProjectValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
    description?: string;
    address?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Validate project creation/update form
 */
export const validateProject = (data: {
  name: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
}): ProjectValidationResult => {
  const errors: ProjectValidationResult['errors'] = {};

  // Validate name
  if (isEmpty(data.name)) {
    errors.name = 'Project name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Project name must be at least 3 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Project name must not exceed 100 characters';
  }

  // Validate description
  if (isEmpty(data.description)) {
    errors.description = 'Description is required';
  } else if (data.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  // Validate address
  if (isEmpty(data.address)) {
    errors.address = 'Address is required';
  } else if (data.address.length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }

  // Validate dates
  if (isEmpty(data.startDate)) {
    errors.startDate = 'Start date is required';
  }

  if (isEmpty(data.endDate)) {
    errors.endDate = 'End date is required';
  }

  if (data.startDate && data.endDate) {
    if (!isValidDateRange(data.startDate, data.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate milestone form
 */
export const validateMilestone = (data: {
  name: string;
  description: string;
  dueDate: string;
}): { isValid: boolean; errors: { name?: string; description?: string; dueDate?: string } } => {
  const errors: { name?: string; description?: string; dueDate?: string } = {};

  if (isEmpty(data.name)) {
    errors.name = 'Milestone name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Milestone name must not exceed 100 characters';
  }

  if (isEmpty(data.description)) {
    errors.description = 'Description is required';
  }

  if (isEmpty(data.dueDate)) {
    errors.dueDate = 'Due date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
