import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Party, PartyFormData, PartyFormErrors } from '../types';
import { PartyType } from '../types';
import { 
  PARTY_TYPE_OPTIONS, 
  CURRENCIES, 
  COUNTRIES, 
  PAYMENT_TERM_OPTIONS,
} from '../partyConstants';
import { 
  validatePartyForm, 
  hasFormErrors, 
  partyToFormData, 
  getEmptyFormData,
  getPartyInitials,
} from '../partyUtils';
import { useUploadPartyLogoMutation } from '../api/partyApi';

interface PartyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartyFormData) => Promise<void>;
  party?: Party | null;
  mode: 'create' | 'edit';
  isDark?: boolean;
  isLoading?: boolean;
}

export const PartyForm: React.FC<PartyFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  party,
  mode,
  isDark = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PartyFormData>(getEmptyFormData());
  const [errors, setErrors] = useState<PartyFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Logo upload mutation
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadPartyLogoMutation();

  // Initialize form data when party changes
  useEffect(() => {
    if (party && mode === 'edit') {
      setFormData(partyToFormData(party));
      setLogoPreview(party.logoUrl || null);
    } else {
      setFormData(getEmptyFormData());
      setLogoPreview(null);
    }
    setErrors({});
    setTouched({});
    setLogoError(null);
  }, [party, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    const newValue = name === 'paymentTermDays' ? parseInt(value, 10) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error on change
    if (errors[name as keyof PartyFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate single field
    const fieldErrors = validatePartyForm(formData);
    if (fieldErrors[name as keyof PartyFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name as keyof PartyFormErrors],
      }));
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setLogoError('Image size must be less than 5MB');
      return;
    }

    setLogoError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload if in edit mode and party exists
    if (mode === 'edit' && party?.id) {
      try {
        await uploadLogo({ id: party.id, file }).unwrap();
      } catch (error) {
        setLogoError('Failed to upload logo. Please try again.');
        // Revert to original logo on error
        setLogoPreview(party.logoUrl || null);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validatePartyForm(formData);
    setErrors(validationErrors);
    
    if (hasFormErrors(validationErrors)) {
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  const inputClasses = cn(
    'w-full px-3 py-2 text-sm rounded-md border transition-colors',
    'focus:outline-none focus:ring-2',
    isDark
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500'
  );

  const labelClasses = cn(
    'block text-sm font-medium mb-1',
    isDark ? 'text-slate-300' : 'text-slate-700'
  );

  const errorClasses = 'text-xs text-red-500 mt-1';

  const getInputError = (field: keyof PartyFormErrors) => {
    return touched[field] && errors[field];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-lg rounded-lg shadow-xl',
            isDark ? 'bg-slate-900' : 'bg-white'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="party-form-title"
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b',
              isDark ? 'border-slate-800' : 'border-slate-200'
            )}
          >
            <h2
              id="party-form-title"
              className={cn(
                'text-lg font-semibold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {mode === 'create' ? 'Add New Party' : 'Edit Party'}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-1 rounded transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              )}
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Logo Upload - Only in edit mode */}
            {mode === 'edit' && party && (
              <div className="flex flex-col items-center pb-4 mb-4 border-b border-dashed" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                <label className={cn(labelClasses, 'mb-2 text-center')}>
                  Party Logo
                </label>
                <div 
                  onClick={handleLogoClick}
                  className={cn(
                    'relative w-20 h-20 rounded-lg cursor-pointer group transition-all',
                    'border-2 border-dashed',
                    isDark 
                      ? 'border-slate-600 hover:border-cyan-500' 
                      : 'border-slate-300 hover:border-teal-500'
                  )}
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt={party.name} 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className={cn(
                      'w-full h-full rounded-lg flex items-center justify-center text-2xl font-semibold',
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    )}>
                      {getPartyInitials(party.name)}
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className={cn(
                    'absolute inset-0 rounded-lg flex items-center justify-center transition-opacity',
                    'bg-black/50 opacity-0 group-hover:opacity-100'
                  )}>
                    {isUploadingLogo ? (
                      <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  aria-label="Upload party logo"
                />
                
                <p className={cn('text-xs mt-2', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  Click to upload logo
                </p>
                
                {logoError && (
                  <p className="text-xs text-red-500 mt-1">{logoError}</p>
                )}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClasses}>
                Party Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(inputClasses, getInputError('name') && 'border-red-500')}
                placeholder="Enter party name"
                autoFocus
              />
              {getInputError('name') && <p className={errorClasses}>{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className={labelClasses}>
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClasses}
              >
                {PARTY_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Country & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className={labelClasses}>
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputClasses, getInputError('country') && 'border-red-500')}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {getInputError('country') && <p className={errorClasses}>{errors.country}</p>}
              </div>

              <div>
                <label htmlFor="currency" className={labelClasses}>
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputClasses, getInputError('currency') && 'border-red-500')}
                >
                  <option value="">Select currency</option>
                  {CURRENCIES.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
                {getInputError('currency') && <p className={errorClasses}>{errors.currency}</p>}
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <label htmlFor="paymentTermDays" className={labelClasses}>
                Payment Terms (Days)
              </label>
              <select
                id="paymentTermDays"
                name="paymentTermDays"
                value={formData.paymentTermDays}
                onChange={handleChange}
                className={inputClasses}
              >
                {PAYMENT_TERM_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className={labelClasses}>
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className={inputClasses}
                placeholder="Enter address"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label htmlFor="contactPerson" className={labelClasses}>
                Contact Person
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Enter contact person name"
              />
            </div>

            {/* Contact Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className={labelClasses}>
                  Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputClasses, getInputError('contactEmail') && 'border-red-500')}
                  placeholder="email@example.com"
                />
                {getInputError('contactEmail') && (
                  <p className={errorClasses}>{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className={labelClasses}>
                  Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(inputClasses, getInputError('contactPhone') && 'border-red-500')}
                  placeholder="+1 234 567 8900"
                />
                {getInputError('contactPhone') && (
                  <p className={errorClasses}>{errors.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              className={cn(
                'flex items-center justify-end gap-3 pt-4 mt-4 border-t',
                isDark ? 'border-slate-800' : 'border-slate-200'
              )}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isDark
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
                  'bg-teal-600 hover:bg-teal-700',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                  isLoading && 'opacity-50 cursor-not-allowed',
                  isDark && 'focus:ring-offset-slate-900'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : mode === 'create' ? (
                  'Add Party'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartyForm;
