import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Download, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { Document } from '../types';

interface DocumentActionsMenuProps {
  document: Document;
  isDark?: boolean;
  onPreview?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onRename?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  canRename?: boolean;
  canDelete?: boolean;
}

export const DocumentActionsMenu: React.FC<DocumentActionsMenuProps> = ({
  document,
  isDark = false,
  onPreview,
  onDownload,
  onRename,
  onDelete,
  canRename = false,
  canDelete = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Theme-aware classes
  const hoverBg = isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100';
  const dropdownClasses = isDark
    ? 'bg-slate-800 border-slate-700 shadow-2xl'
    : 'bg-white border-slate-200 shadow-lg';
  const textTertiary = isDark ? 'text-slate-300' : 'text-slate-700';
  const iconClasses = isDark ? 'text-slate-400' : 'text-slate-400';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    globalThis.document.addEventListener('mousedown', handleClickOutside);
    return () => globalThis.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void | undefined) => {
    action?.();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-lg transition-colors',
          isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 z-50 mt-1 w-48 border rounded-lg',
          dropdownClasses
        )}>
          <div className="py-1">
            {/* Preview */}
            {onPreview && (
              <button
                onClick={() => handleAction(() => onPreview(document))}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                  textTertiary,
                  hoverBg
                )}
              >
                <Eye className={cn('w-4 h-4', iconClasses)} />
                Preview
              </button>
            )}

            {/* Download */}
            {onDownload && (
              <button
                onClick={() => handleAction(() => onDownload(document))}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                  textTertiary,
                  hoverBg
                )}
              >
                <Download className={cn('w-4 h-4', iconClasses)} />
                Download
              </button>
            )}

            {/* Rename */}
            {canRename && onRename && (
              <button
                onClick={() => handleAction(() => onRename(document))}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                  textTertiary,
                  hoverBg
                )}
              >
                <Edit2 className={cn('w-4 h-4', iconClasses)} />
                Rename
              </button>
            )}

            {/* Delete */}
            {canDelete && onDelete && (
              <>
                <div className={cn(
                  'my-1',
                  isDark ? 'border-slate-700' : 'border-slate-100'
                )} style={{ borderTopWidth: '1px' }} />
                <button
                  onClick={() => handleAction(() => onDelete(document))}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-red-500 transition-colors',
                    isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
