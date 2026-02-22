// @/utils/phoneValidation.ts

// Common phone number patterns for different countries
interface PhoneValidationRule {
  regex: RegExp;
  minLength: number;
  maxLength: number;
  example: string;
  format?: (phone: string) => string;
}

type CountryCode = string;

export const phoneValidationRules: Record<CountryCode, PhoneValidationRule> = {
  // North America
  '+1': {
    regex: /^[2-9]\d{2}[2-9]\d{2}\d{4}$/,
    minLength: 10,
    maxLength: 10,
    example: '5551234567',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
      return phone;
    }
  },
  
  // United Kingdom
  '+44': {
    regex: /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/,
    minLength: 10,
    maxLength: 11,
    example: '7911123456',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      }
      return phone;
    }
  },
  
  // Australia
  '+61': {
    regex: /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/,
    minLength: 9,
    maxLength: 10,
    example: '412345678',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{2})/, '$1 $2 $3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      }
      return phone;
    }
  },
  
  // India
  '+91': {
    regex: /^[6-9]\d{9}$/,
    minLength: 10,
    maxLength: 10,
    example: '9876543210',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
      }
      return phone;
    }
  },
  
  // Canada (same as US but with area code validation)
  // Note: Using +1 for both US and Canada, but you can separate if needed
  
  // Germany
  '+49': {
    regex: /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)49\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:\d{5}\)?[\s-]?\d{4,5}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{2}\)?[\s-]?\d{4}[\s-]?\d{4})(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/,
    minLength: 10,
    maxLength: 11,
    example: '15123456789',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        return cleaned.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1 $2 $3');
      }
      return phone;
    }
  },
  
  // France
  '+33': {
    regex: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    minLength: 9,
    maxLength: 10,
    example: '612345678',
    format: (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 9) {
        return cleaned.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      }
      return phone;
    }
  },
  
  // Default rule for countries without specific validation
  'default': {
    regex: /^[0-9\-\+\s\(\)]{6,15}$/,
    minLength: 6,
    maxLength: 15,
    example: '1234567890',
    format: (phone: string) => phone
  }
};

/**
 * Get validation rule for a country code
 */
export const getPhoneValidationRule = (countryCode: string): PhoneValidationRule => {
  return phoneValidationRules[countryCode] || phoneValidationRules['default'];
};

/**
 * Validate phone number based on country
 */
export const validatePhoneNumber = (phone: string, countryCode: string): {
  isValid: boolean;
  formattedPhone?: string;
  error?: string;
  rule: PhoneValidationRule;
} => {
  const rule = getPhoneValidationRule(countryCode);
  const cleanedPhone = phone.replace(/\D/g, '');
  
  if (cleanedPhone.length === 0) {
    return {
      isValid: false,
      error: 'Phone number is required',
      rule
    };
  }
  
  if (cleanedPhone.length < rule.minLength) {
    return {
      isValid: false,
      error: `Phone number must be at least ${rule.minLength} digits`,
      rule
    };
  }
  
  if (cleanedPhone.length > rule.maxLength) {
    return {
      isValid: false,
      error: `Phone number cannot exceed ${rule.maxLength} digits`,
      rule
    };
  }
  
  // Test against regex pattern
  const isValid = rule.regex.test(cleanedPhone);
  
  // Format the phone number if valid
  const formattedPhone = isValid && rule.format ? rule.format(cleanedPhone) : undefined;
  
  return {
    isValid,
    formattedPhone,
    error: isValid ? undefined : `Invalid phone number format. Example: ${rule.example}`,
    rule
  };
};

/**
 * Format phone number as user types
 */
export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const rule = getPhoneValidationRule(countryCode);
  
  if (!rule.format || cleaned.length < rule.minLength) {
    return phone;
  }
  
  // Apply formatting
  return rule.format(cleaned);
};

/**
 * Get phone number example for a country
 */
export const getPhoneExample = (countryCode: string): string => {
  const rule = getPhoneValidationRule(countryCode);
  return rule.example;
};