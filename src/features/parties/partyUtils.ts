import { UserRole } from '../../types';
import { hasPermission } from '../../utils/roleHelpers';
import type { Party, PartyFormData, PartyFormErrors } from './types';
import { PARTY_VALIDATION, EMPTY_PARTY_FORM } from './partyConstants';

// Permission Helpers
export const canViewParties = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role, 'parties.view');
};

export const canCreateParty = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role, 'parties.create');
};

export const canEditParty = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role, 'parties.edit');
};

export const canDeleteParty = (role: UserRole | undefined | null): boolean => {
  return hasPermission(role, 'parties.delete');
};

// Check if user has finance-level access (Admin or Finance)
export const hasPartyWriteAccess = (role: UserRole | undefined | null): boolean => {
  return role === UserRole.ADMIN || role === UserRole.FINANCE;
};

// Form Validation
export const validatePartyForm = (data: PartyFormData): PartyFormErrors => {
  const errors: PartyFormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Party name is required';
  } else if (data.name.length < PARTY_VALIDATION.name.minLength) {
    errors.name = `Name must be at least ${PARTY_VALIDATION.name.minLength} characters`;
  } else if (data.name.length > PARTY_VALIDATION.name.maxLength) {
    errors.name = `Name must be less than ${PARTY_VALIDATION.name.maxLength} characters`;
  }

  // Type validation
  if (!data.type) {
    errors.type = 'Party type is required';
  }

  // Country validation
  if (!data.country.trim()) {
    errors.country = 'Country is required';
  }

  // Currency validation
  if (!data.currency.trim()) {
    errors.currency = 'Currency is required';
  }

  // Payment Terms validation
  if (data.paymentTermDays < PARTY_VALIDATION.paymentTermDays.min) {
    errors.paymentTermDays = `Payment terms must be at least ${PARTY_VALIDATION.paymentTermDays.min} days`;
  } else if (data.paymentTermDays > PARTY_VALIDATION.paymentTermDays.max) {
    errors.paymentTermDays = `Payment terms must be less than ${PARTY_VALIDATION.paymentTermDays.max} days`;
  }

  // Email validation (optional but must be valid if provided)
  if (data.contactEmail && !PARTY_VALIDATION.contactEmail.pattern.test(data.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address';
  }

  // Phone validation (optional but must be valid if provided)
  if (data.contactPhone) {
    if (!PARTY_VALIDATION.contactPhone.pattern.test(data.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    } else if (data.contactPhone.length < PARTY_VALIDATION.contactPhone.minLength) {
      errors.contactPhone = 'Phone number is too short';
    } else if (data.contactPhone.length > PARTY_VALIDATION.contactPhone.maxLength) {
      errors.contactPhone = 'Phone number is too long';
    }
  }

  return errors;
};

// Check if form has any errors
export const hasFormErrors = (errors: PartyFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Convert Party to Form Data
export const partyToFormData = (party: Party): PartyFormData => {
  console.log('Converting party to form data:', party);
  return {
    name: party.name,
    type: party.type,
    country: party.country,
    currency: party.currency,
    paymentTermDays: party.paymentTermDays,
    address: party.address || '',
    contactPerson: party.contactPerson || '',
    contactEmail: party.contactEmail || '',
    contactPhone: party.contactPhone || '',
  };
};

// Get empty form data
export const getEmptyFormData = (): PartyFormData => {
  return { ...EMPTY_PARTY_FORM };
};

// Format payment terms for display
export const formatPaymentTerms = (days: number): string => {
  if (days === 0) return 'Immediate';
  if (days === 1) return '1 Day';
  return `${days} Days`;
};

// Get party initials for avatar
export const getPartyInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

// Sort parties by name
export const sortPartiesByName = (parties: Party[]): Party[] => {
  return [...parties].sort((a, b) => a.name.localeCompare(b.name));
};

// Filter parties by search term
export const filterPartiesBySearch = (parties: Party[], searchTerm: string): Party[] => {
  if (!searchTerm.trim()) return parties;
  
  const term = searchTerm.toLowerCase();
  return parties.filter(party =>
    party.name.toLowerCase().includes(term) ||
    party.country.toLowerCase().includes(term) ||
    party.contactPerson?.toLowerCase().includes(term) ||
    party.contactEmail?.toLowerCase().includes(term)
  );
};
