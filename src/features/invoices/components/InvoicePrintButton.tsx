import React, { useState, useCallback } from 'react';
import { Printer, Download, Eye, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Invoice } from '../types';
import type { Company } from '../../../types';
import { downloadInvoicePdf, previewInvoicePdf, type PdfPartyData } from '../utils/invoicePdfGenerator';

interface InvoicePrintButtonProps {
  invoice: Invoice;
  company?: Company;
  party?: PdfPartyData;
  isDark?: boolean;
  variant?: 'button' | 'icon' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InvoicePrintButton: React.FC<InvoicePrintButtonProps> = ({
  invoice,
  company,
  party,
  isDark = false,
  variant = 'button',
  size = 'md',
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsLoading(true);
    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 100));
      downloadInvoicePdf({ invoice, company, party });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  }, [invoice, company, party]);

  const handlePreview = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      previewInvoicePdf({ invoice, company, party });
    } catch (error) {
      console.error('Failed to preview PDF:', error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  }, [invoice, company, party]);

  const handlePrint = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Generate PDF and print
      const { generateInvoicePdf } = await import('../utils/invoicePdfGenerator');
      const doc = generateInvoicePdf({ invoice, company, party });
      
      // Open in new window and trigger print
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Failed to print PDF:', error);
    } finally {
      setIsLoading(false);
      setShowDropdown(false);
    }
  }, [invoice, company, party]);

  // Size classes
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={isLoading}
        title="Download PDF"
        className={cn(
          'p-2 rounded-lg transition-colors',
          isDark
            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        ) : (
          <Printer className={iconSizes[size]} />
        )}
      </button>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 font-medium rounded-lg transition-colors',
            sizeClasses[size],
            isDark
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white',
            isLoading && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {isLoading ? (
            <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
          ) : (
            <Printer className={iconSizes[size]} />
          )}
          <span>Print / Export</span>
          <ChevronDown className={cn(iconSizes[size], 'ml-1')} />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Menu */}
            <div
              className={cn(
                'absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-20',
                isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
              )}
            >
              <div className="py-1">
                <button
                  onClick={handleDownload}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors',
                    isDark
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handlePreview}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors',
                    isDark
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Eye className="w-4 h-4" />
                  Preview PDF
                </button>
                <button
                  onClick={handlePrint}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors',
                    isDark
                      ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 font-medium rounded-lg transition-colors',
        sizeClasses[size],
        isDark
          ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <Download className={iconSizes[size]} />
      )}
      <span>Download PDF</span>
    </button>
  );
};

export default InvoicePrintButton;
