// src/validators/quote.validators.ts
import { isEmpty } from '@/utils/validation.utils';

/**
 * Quote form validators
 */

export interface QuoteItemValidationResult {
  isValid: boolean;
  errors: {
    description?: string;
    quantity?: string;
    unitPrice?: string;
  };
}

export interface QuoteValidationResult {
  isValid: boolean;
  errors: {
    items?: string;
    validUntil?: string;
  };
}

/**
 * Validate quote item
 */
export const validateQuoteItem = (data: {
  description: string;
  quantity: number;
  unitPrice: number;
}): QuoteItemValidationResult => {
  const errors: QuoteItemValidationResult['errors'] = {};

  // Validate description
  if (isEmpty(data.description)) {
    errors.description = 'Description is required';
  } else if (data.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // Validate quantity
  if (!data.quantity || data.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  } else if (data.quantity > 999999) {
    errors.quantity = 'Quantity is too large';
  }

  // Validate unit price
  if (!data.unitPrice || data.unitPrice <= 0) {
    errors.unitPrice = 'Unit price must be greater than 0';
  } else if (data.unitPrice > 999999999) {
    errors.unitPrice = 'Unit price is too large';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate quote form
 */
export const validateQuote = (data: {
  items: any[];
  validUntil: string;
}): QuoteValidationResult => {
  const errors: QuoteValidationResult['errors'] = {};

  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    // Validate each item
    const hasInvalidItems = data.items.some(item => {
      const itemValidation = validateQuoteItem(item);
      return !itemValidation.isValid;
    });

    if (hasInvalidItems) {
      errors.items = 'Some items have invalid data';
    }
  }

  // Validate valid until date
  if (isEmpty(data.validUntil)) {
    errors.validUntil = 'Valid until date is required';
  } else {
    const validDate = new Date(data.validUntil);
    const today = new Date();
    if (validDate <= today) {
      errors.validUntil = 'Valid until date must be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
