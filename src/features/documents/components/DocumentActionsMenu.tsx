import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; openUpward: boolean }>({
    top: 0,
    left: 0,
    openUpward: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      const targetNode = event.target as Node;
      const clickedInsideWrapper = menuRef.current?.contains(targetNode);
      const clickedInsidePortalMenu = portalMenuRef.current?.contains(targetNode);
      const clickedMenuButton = buttonRef.current?.contains(targetNode);

      if (!clickedInsideWrapper && !clickedInsidePortalMenu && !clickedMenuButton) {
        setIsOpen(false);
      }
    };

    globalThis.document.addEventListener('mousedown', handleClickOutside);
    return () => globalThis.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedMenuHeight = 220;
      const viewportPadding = 8;
      const menuWidth = 192;

      const spaceBelow = globalThis.window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < estimatedMenuHeight;

      const left = Math.max(
        viewportPadding,
        Math.min(rect.right - menuWidth, globalThis.window.innerWidth - menuWidth - viewportPadding)
      );

      const top = openUpward
        ? Math.max(viewportPadding, rect.top - viewportPadding)
        : Math.min(rect.bottom + 4, globalThis.window.innerHeight - viewportPadding);

      setMenuPosition({ top, left, openUpward });
    };

    const closeOnScroll = () => setIsOpen(false);

    updateMenuPosition();
    globalThis.window.addEventListener('resize', updateMenuPosition);
    globalThis.window.addEventListener('scroll', closeOnScroll, true);

    return () => {
      globalThis.window.removeEventListener('resize', updateMenuPosition);
      globalThis.window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [isOpen]);

  const handleAction = (action: () => void | undefined) => {
    action?.();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
      <button
        ref={buttonRef}
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
      {isOpen && createPortal(
        <div
          ref={portalMenuRef}
          className={cn(
            'fixed z-[9999] w-48 max-h-[70vh] overflow-y-auto border rounded-lg',
            dropdownClasses
          )}
          style={{
            left: `${menuPosition.left}px`,
            top: `${menuPosition.top}px`,
            transform: menuPosition.openUpward ? 'translateY(-100%)' : undefined,
          }}
        >
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
        </div>,
        globalThis.document.body
      )}
    </div>
  );
};
