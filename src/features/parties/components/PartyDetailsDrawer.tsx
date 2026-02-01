import React from 'react';
import { X, Mail, Phone, MapPin, Building2, Calendar } from 'lucide-react';
import { cn, formatDate } from '../../../utils/helpers';
import type { Party } from '../types';
import { PartyTypeBadge } from './PartyTypeBadge';
import { PartyStatusBadge } from './PartyStatusBadge';
import { formatPaymentTerms, getPartyInitials } from '../partyUtils';

interface PartyDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  party: Party | null;
  isDark?: boolean;
}

interface DetailRowProps {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isDark: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, isDark }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 py-3">
      {icon && (
        <div className={cn('mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium uppercase tracking-wide mb-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {label}
        </p>
        <div className={cn('text-sm', isDark ? 'text-slate-200' : 'text-slate-700')}>
          {value}
        </div>
      </div>
    </div>
  );
};

export const PartyDetailsDrawer: React.FC<PartyDetailsDrawerProps> = ({
  isOpen,
  onClose,
  party,
  isDark = false,
}) => {
  if (!isOpen || !party) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div
          className={cn(
            'w-screen max-w-md transform transition-transform',
            isDark ? 'bg-slate-900' : 'bg-white'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="party-details-title"
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-6 py-4 border-b',
              isDark ? 'border-slate-800' : 'border-slate-200'
            )}
          >
            <h2
              id="party-details-title"
              className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}
            >
              Party Details
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-1 rounded transition-colors',
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              )}
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-65px)]">
            {/* Party Header */}
            <div
              className={cn(
                'px-6 py-6 border-b',
                isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Logo/Avatar */}
                {party.logoUrl ? (
                  <img
                    src={party.logoUrl}
                    alt={party.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      'w-16 h-16 rounded-lg flex items-center justify-center text-xl font-semibold',
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {getPartyInitials(party.name)}
                  </div>
                )}

                {/* Name & Badges */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      'text-xl font-semibold mb-2 truncate',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {party.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PartyTypeBadge type={party.type} isDark={isDark} size="md" />
                    <PartyStatusBadge isActive={party.isActive} isDark={isDark} size="md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Details Sections */}
            <div className="px-6">
              {/* Business Details */}
              <div className={cn('py-4 border-b', isDark ? 'border-slate-800' : 'border-slate-100')}>
                <h4
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider mb-2',
                    isDark ? 'text-cyan-400' : 'text-teal-600'
                  )}
                >
                  Business Details
                </h4>

                <DetailRow
                  icon={<Building2 className="w-4 h-4" />}
                  label="Country"
                  value={party.country}
                  isDark={isDark}
                />

                <DetailRow
                  label="Currency"
                  value={
                    <span className="font-mono">{party.currency}</span>
                  }
                  isDark={isDark}
                />

                <DetailRow
                  label="Payment Terms"
                  value={formatPaymentTerms(party.paymentTermDays)}
                  isDark={isDark}
                />

                {party.address && (
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Address"
                    value={<span className="whitespace-pre-line">{party.address}</span>}
                    isDark={isDark}
                  />
                )}
              </div>

              {/* Contact Information */}
              {(party.contactPerson || party.contactEmail || party.contactPhone) && (
                <div className={cn('py-4 border-b', isDark ? 'border-slate-800' : 'border-slate-100')}>
                  <h4
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider mb-2',
                      isDark ? 'text-cyan-400' : 'text-teal-600'
                    )}
                  >
                    Contact Information
                  </h4>

                  {party.contactPerson && (
                    <DetailRow
                      label="Contact Person"
                      value={party.contactPerson}
                      isDark={isDark}
                    />
                  )}

                  {party.contactEmail && (
                    <DetailRow
                      icon={<Mail className="w-4 h-4" />}
                      label="Email"
                      value={
                        <a
                          href={`mailto:${party.contactEmail}`}
                          className={cn(
                            'hover:underline',
                            isDark ? 'text-cyan-400' : 'text-teal-600'
                          )}
                        >
                          {party.contactEmail}
                        </a>
                      }
                      isDark={isDark}
                    />
                  )}

                  {party.contactPhone && (
                    <DetailRow
                      icon={<Phone className="w-4 h-4" />}
                      label="Phone"
                      value={
                        <a
                          href={`tel:${party.contactPhone}`}
                          className={cn(
                            'hover:underline',
                            isDark ? 'text-cyan-400' : 'text-teal-600'
                          )}
                        >
                          {party.contactPhone}
                        </a>
                      }
                      isDark={isDark}
                    />
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="py-4">
                <h4
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider mb-2',
                    isDark ? 'text-cyan-400' : 'text-teal-600'
                  )}
                >
                  Record Information
                </h4>

                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Created"
                  value={formatDate(party.createdAt)}
                  isDark={isDark}
                />

                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Last Updated"
                  value={formatDate(party.updatedAt)}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyDetailsDrawer;
