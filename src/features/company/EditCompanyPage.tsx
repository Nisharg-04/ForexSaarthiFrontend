
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Building2 } from 'lucide-react';
import { useAuth, useAppSelector } from '../../hooks/useRedux';
import { useGetCompanyQuery, useUpdateCompanyMutation, useDeleteCompanyMutation, useUploadCompanyLogoMutation } from '../../services/companyApi';
import { isAdmin } from '../../utils/roleHelpers';
import { CURRENCIES, COUNTRIES } from '../../constants';
import { useActionBar, type ActionItem } from '../../components/ui/BottomActionBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { cn } from '../../utils/helpers';

export const EditCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompany, role } = useAuth();
  const { setActions, clearActions } = useActionBar();
  const theme = useAppSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const { data: companyData, isLoading: isLoadingCompany, refetch } = useGetCompanyQuery(
    activeCompany?.companyId || '',
    { skip: !activeCompany?.companyId }
  );
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadCompanyLogoMutation();

  const [formData, setFormData] = useState({
    name: '',
    iecNumber: '',
    gstNumber: '',
    taxId: '',
    registrationNumber: '',
    address: '',
    country: 'India',
    baseCurrency: 'INR',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form with company data
  useEffect(() => {
    if (companyData?.data) {
      setFormData({
        name: companyData.data.name || '',
        iecNumber: companyData.data.iecNumber || '',
        gstNumber: companyData.data.gstNumber || '',
        taxId: companyData.data.taxId || '',
        registrationNumber: companyData.data.registrationNumber || '',
        address: companyData.data.address || '',
        country: companyData.data.country || 'India',
        baseCurrency: companyData.data.baseCurrency || 'INR',
      });
      setLogoUrl(companyData.data.logoUrl || null);
    }
  }, [companyData]);

  // Check admin access
  useEffect(() => {
    if (!isAdmin(role)) {
      navigate('/dashboard');
    }
  }, [role, navigate]);

  // Set up bottom action bar
  useEffect(() => {
    const actions: ActionItem[] = [
      {
        id: 'delete-company',
        label: 'Delete Company',
        variant: 'danger',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => setShowDeleteConfirm(true),
        disabled: isDeleting,
      },
      {
        id: 'save-company',
        label: 'Save Changes',
        variant: 'primary',
        icon: (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        onClick: handleSubmit,
        disabled: isUpdating,
      },
    ];

    setActions(actions);
    return () => clearActions();
  }, [setActions, clearActions, isUpdating, isDeleting, formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCompany?.companyId) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }

    try {
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadLogo({
        companyId: activeCompany.companyId,
        formData,
      }).unwrap();

      if (result.success) {
        setSuccessMessage('Logo updated successfully!');
        setLogoUrl(result.data?.logoUrl || null);
        refetch();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || 'Failed to upload logo');
      }
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to upload logo');
    }

    // Reset file input
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!activeCompany?.companyId) return;
    
    setError(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      await updateCompany({
        id: activeCompany.companyId,
        name: formData.name,
        iecNumber: formData.iecNumber || undefined,
        gstNumber: formData.gstNumber || undefined,
        taxId: formData.taxId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        address: formData.address || undefined,
        country: formData.country || undefined,
        baseCurrency: formData.baseCurrency,
      }).unwrap();
      setSuccessMessage('Company updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to update company');
    }
  };

  const handleDelete = async () => {
    if (!activeCompany?.companyId) return;

    try {
      await deleteCompany(activeCompany.companyId).unwrap();
      navigate('/dashboard/select-company');
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string } };
      setError(apiError?.data?.message || 'Failed to delete company');
      setShowDeleteConfirm(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={cn(
          "w-8 h-8 border-2 rounded-full animate-spin",
          isDark ? "border-slate-600 border-t-cyan-400" : "border-slate-300 border-t-slate-600"
        )}></div>
      </div>
    );
  }

  const inputClasses = cn(
    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent",
    isDark 
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-cyan-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-slate-500"
  );

  const labelClasses = cn(
    "block text-sm font-medium mb-1.5",
    isDark ? "text-slate-300" : "text-slate-700"
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className={cn(
            "flex items-center gap-1 text-sm mb-4 transition-colors",
            isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>
          Edit Company
        </h1>
        <p className={cn("text-sm mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
          Update company information and branding
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className={cn(
          "mb-4 p-3 text-sm border rounded-md",
          isDark ? "bg-red-900/20 text-red-400 border-red-800" : "bg-red-50 text-red-700 border-red-200"
        )}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className={cn(
          "mb-4 p-3 text-sm border rounded-md",
          isDark ? "bg-green-900/20 text-green-400 border-green-800" : "bg-green-50 text-green-700 border-green-200"
        )}>
          {successMessage}
        </div>
      )}

      {/* Logo Section */}
      <div className={cn(
        "border rounded-lg p-6 mb-6",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <h2 className={cn("text-sm font-medium mb-4", isDark ? "text-slate-300" : "text-slate-700")}>
          Company Logo
        </h2>
        <div className="flex items-center gap-6">
          {/* Logo Preview */}
          <div 
            onClick={handleLogoClick}
            className={cn(
              "relative w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer group overflow-hidden border-2 border-dashed transition-colors",
              isDark 
                ? "bg-slate-800 border-slate-700 hover:border-cyan-500" 
                : "bg-slate-100 border-slate-300 hover:border-teal-500"
            )}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className={cn(
                "w-10 h-10",
                isDark ? "text-slate-600" : "text-slate-400"
              )} />
            )}
            {/* Hover overlay */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
              isDark ? "bg-slate-900/80" : "bg-white/80"
            )}>
              <Camera className={cn(
                "w-6 h-6",
                isDark ? "text-cyan-400" : "text-teal-600"
              )} />
            </div>
            {isUploadingLogo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleLogoClick}
              disabled={isUploadingLogo}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isDark 
                  ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300"
              )}
            >
              {isUploadingLogo ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
            <p className={cn("text-xs mt-2", isDark ? "text-slate-500" : "text-slate-500")}>
              JPEG, PNG, GIF or WebP. Max 5MB.
            </p>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Company Information Form */}
      <div className={cn(
        "border rounded-lg p-6",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <h2 className={cn("text-sm font-medium mb-4", isDark ? "text-slate-300" : "text-slate-700")}>
          Company Information
        </h2>

        <div className="space-y-5">
          {/* Company Name */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter company name"
              className={inputClasses}
            />
          </div>

          {/* Two column grid for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IEC Number */}
            <div>
              <label htmlFor="iecNumber" className={labelClasses}>
                IEC Number
              </label>
              <input
                type="text"
                id="iecNumber"
                name="iecNumber"
                value={formData.iecNumber}
                onChange={handleChange}
                placeholder="e.g., AAACA1234A"
                className={inputClasses}
              />
              <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-500")}>
                Import Export Code
              </p>
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gstNumber" className={labelClasses}>
                GST Number
              </label>
              <input
                type="text"
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="e.g., 22AAAAA0000A1Z5"
                className={inputClasses}
              />
            </div>

            {/* Tax ID */}
            <div>
              <label htmlFor="taxId" className={labelClasses}>
                Tax ID / PAN
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                placeholder="e.g., AAACA1234A"
                className={inputClasses}
              />
            </div>

            {/* Registration Number */}
            <div>
              <label htmlFor="registrationNumber" className={labelClasses}>
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="Company registration number"
                className={inputClasses}
              />
              <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-500")}>
                CIN / Registration No.
              </p>
            </div>
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
              placeholder="Enter company address"
              rows={3}
              className={inputClasses}
            />
          </div>

          {/* Two column grid for country and currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Country */}
            <div>
              <label htmlFor="country" className={labelClasses}>
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={inputClasses}
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Currency */}
            <div>
              <label htmlFor="baseCurrency" className={labelClasses}>
                Base Currency
              </label>
              <select
                id="baseCurrency"
                name="baseCurrency"
                value={formData.baseCurrency}
                onChange={handleChange}
                className={inputClasses}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-500")}>
                Primary currency for accounting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Company"
        message="Are you sure you want to delete this company? This action cannot be undone and all associated data will be permanently removed."
        confirmLabel="Delete Company"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
