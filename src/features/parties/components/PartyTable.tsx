import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Party } from '../types';
import { PartyTypeBadge } from './PartyTypeBadge';
import { PartyStatusBadge } from './PartyStatusBadge';
import { formatPaymentTerms, getPartyInitials, canEditParty, canDeleteParty } from '../partyUtils';
import { UserRole } from '../../../types';

interface PartyTableProps {
  parties: Party[];
  isDark?: boolean;
  userRole?: UserRole;
  onView: (party: Party) => void;
  onEdit: (party: Party) => void;
  onDelete: (party: Party) => void;
  selectedPartyId?: string | null;
}

export const PartyTable: React.FC<PartyTableProps> = ({
  parties,
  isDark = false,
  userRole,
  onView,
  onEdit,
  onDelete,
  selectedPartyId,
}) => {
  const canEdit = canEditParty(userRole);
  const canDelete = canDeleteParty(userRole);   
  

  // Empty State
  console.log('Rendering PartyTable with parties:', parties);
  if (parties.length === 0) {
    return (
      <div
        className={cn(
          'text-center py-16 rounded-lg border',
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        )}
      >
        <div className={cn(
          'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
          isDark ? 'bg-slate-800' : 'bg-slate-100'
        )}>
          <svg
            className={cn('w-8 h-8', isDark ? 'text-slate-600' : 'text-slate-400')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className={cn(
          'text-lg font-medium mb-1',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          No parties found
        </h3>
        <p className={cn(
          'text-sm',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          Add your first buyer or supplier to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border',
        isDark ? 'border-slate-800' : 'border-slate-200'
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={cn(
                'text-left text-xs font-medium uppercase tracking-wider',
                isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'
              )}
            >
              <th scope="col" className="px-4 py-3">Party Name</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3">Country</th>
              <th scope="col" className="px-4 py-3">Currency</th>
              <th scope="col" className="px-4 py-3">Payment Terms</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={cn(
            'divide-y',
            isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white'
          )}>
            {parties.map((party) => (
              <tr
                key={party.id}
                className={cn(
                  'transition-colors',
                  selectedPartyId === party.id
                    ? isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-50'
                    : isDark
                      ? 'hover:bg-slate-800/50'
                      : 'hover:bg-slate-50/50',
                  'focus-within:ring-2 focus-within:ring-inset',
                  isDark ? 'focus-within:ring-cyan-500' : 'focus-within:ring-teal-500'
                )}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onView(party);
                  }
                }}
              >
                {/* Party Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {party.logoUrl ? (
                      <img
                        src={party.logoUrl}
                        alt={party.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'w-8 h-8 rounded flex items-center justify-center text-xs font-semibold',
                          isDark
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {getPartyInitials(party.name)}
                      </div>
                    )}
                    <div>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {party.name}
                      </p>
                      {party.contactPerson && (
                        <p
                          className={cn(
                            'text-xs',
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          )}
                        >
                          {party.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                  <PartyTypeBadge type={party.type} isDark={isDark} />
                </td>

                {/* Country */}
                <td className="px-4 py-3">
                  <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    {party.country}
                  </span>
                </td>

                {/* Currency */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-sm font-mono',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    {party.currency}
                  </span>
                </td>

                {/* Payment Terms */}
                <td className="px-4 py-3">
                  <span className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    {formatPaymentTerms(party.paymentTermDays)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <PartyStatusBadge isActive={party.isActive} isDark={isDark} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* View - All roles */}
                    <button
                      onClick={() => onView(party)}
                      className={cn(
                        'p-1.5 rounded transition-colors',
                        isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      )}
                      title="View details"
                      aria-label={`View ${party.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit - Admin & Finance only */}
                    {canEdit && (
                      <button
                        onClick={() => onEdit(party)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          isDark
                            ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        )}
                        title="Edit party"
                        aria-label={`Edit ${party.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete - Admin only */}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(party)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          isDark
                            ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700'
                            : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                        )}
                        title="Delete party"
                        aria-label={`Delete ${party.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartyTable;
