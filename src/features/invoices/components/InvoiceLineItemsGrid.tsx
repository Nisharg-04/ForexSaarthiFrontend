import React, { useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import type { LineItemFormData } from '../types';
import { LINE_ITEM_UNITS } from '../invoiceConstants';
import {
  validateLineItem,
  parseNumericInput,
  calculateLineTotal,
  formatGridNumber,
  createEmptyLineItem,
} from '../invoiceUtils';

interface InvoiceLineItemsGridProps {
  lineItems: LineItemFormData[];
  onChange: (items: LineItemFormData[]) => void;
  isDark?: boolean;
  isReadOnly?: boolean;
  currency?: string;
}

export const InvoiceLineItemsGrid: React.FC<InvoiceLineItemsGridProps> = ({
  lineItems,
  onChange,
  isDark = false,
  isReadOnly = false,
  currency = 'USD',
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const lastAddedRowRef = useRef<string | null>(null);

  // Focus the first input of newly added row
  useEffect(() => {
    if (lastAddedRowRef.current && gridRef.current) {
      const row = gridRef.current.querySelector(`[data-row-id="${lastAddedRowRef.current}"]`);
      if (row) {
        const firstInput = row.querySelector('input, select') as HTMLElement;
        firstInput?.focus();
      }
      lastAddedRowRef.current = null;
    }
  }, [lineItems.length]);

  const handleAddRow = useCallback(() => {
    const newItem = createEmptyLineItem();
    lastAddedRowRef.current = newItem.id;
    onChange([...lineItems, newItem]);
  }, [lineItems, onChange]);

  const handleRemoveRow = useCallback(
    (id: string) => {
      if (lineItems.length <= 1) return; // Keep at least one row
      onChange(lineItems.filter((item) => item.id !== id));
    },
    [lineItems, onChange]
  );

  const handleCellChange = useCallback(
    (id: string, field: keyof LineItemFormData, value: string) => {
      onChange(
        lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    },
    [lineItems, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
      const totalCols = 5; // description, hsCode, qty, unit, unitPrice

      if (e.key === 'Tab' && !e.shiftKey && rowIndex === lineItems.length - 1 && colIndex === totalCols - 1) {
        // Tab on last cell of last row - add new row
        e.preventDefault();
        handleAddRow();
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Move to next row same column
        if (rowIndex < lineItems.length - 1) {
          const nextRow = gridRef.current?.querySelector(
            `[data-row-index="${rowIndex + 1}"] [data-col-index="${colIndex}"]`
          ) as HTMLElement;
          nextRow?.focus();
        } else {
          handleAddRow();
        }
      }

      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAddRow();
      }

      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (lineItems.length > 1) {
          handleRemoveRow(lineItems[rowIndex].id);
        }
      }
    },
    [lineItems, handleAddRow, handleRemoveRow]
  );

  const getRowErrors = (item: LineItemFormData) => {
    if (isReadOnly) return {};
    return validateLineItem(item);
  };

  const calculateRowTotal = (item: LineItemFormData): number => {
    const qty = parseNumericInput(item.quantity);
    const price = parseNumericInput(item.unitPrice);
    return calculateLineTotal(qty, price);
  };

  const inputBaseClass = cn(
    'w-full px-2 py-1.5 text-sm border-0 bg-transparent transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-inset rounded',
    isDark
      ? 'text-white placeholder-slate-500 focus:ring-cyan-500/50'
      : 'text-slate-900 placeholder-slate-400 focus:ring-teal-500/50'
  );

  const cellClass = cn(
    'border-r last:border-r-0',
    isDark ? 'border-slate-700' : 'border-slate-200'
  );

  return (
    <div
      ref={gridRef}
      className={cn(
        'rounded-lg border overflow-hidden',
        isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'grid grid-cols-[1fr_100px_80px_80px_100px_100px_40px] text-xs font-medium uppercase tracking-wider',
          isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'
        )}
      >
        <div className={cn('px-3 py-2.5', cellClass)}>Description</div>
        <div className={cn('px-3 py-2.5', cellClass)}>HS Code</div>
        <div className={cn('px-3 py-2.5 text-right', cellClass)}>Qty</div>
        <div className={cn('px-3 py-2.5', cellClass)}>Unit</div>
        <div className={cn('px-3 py-2.5 text-right', cellClass)}>Unit Price</div>
        <div className={cn('px-3 py-2.5 text-right', cellClass)}>Total</div>
        <div className="px-2 py-2.5"></div>
      </div>

      {/* Body */}
      <div className={cn('divide-y', isDark ? 'divide-slate-700' : 'divide-slate-200')}>
        {lineItems.map((item, rowIndex) => {
          const errors = getRowErrors(item);
          const hasErrors = Object.keys(errors).length > 0;
          const rowTotal = calculateRowTotal(item);

          return (
            <div
              key={item.id}
              data-row-id={item.id}
              data-row-index={rowIndex}
              className={cn(
                'grid grid-cols-[1fr_100px_80px_80px_100px_100px_40px] items-center',
                hasErrors && (isDark ? 'bg-red-900/10' : 'bg-red-50/50'),
                isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'
              )}
            >
              {/* Description */}
              <div className={cn('relative', cellClass)}>
                {isReadOnly ? (
                  <div className="px-3 py-2 text-sm">{item.description}</div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleCellChange(item.id, 'description', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                      data-col-index={0}
                      placeholder="Enter description..."
                      className={cn(inputBaseClass, errors.description && 'pr-8')}
                      aria-label="Description"
                      aria-invalid={!!errors.description}
                    />
                    {errors.description && (
                      <AlertCircle
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500"
                        title={errors.description}
                      />
                    )}
                  </>
                )}
              </div>

              {/* HS Code */}
              <div className={cn('relative', cellClass)}>
                {isReadOnly ? (
                  <div className="px-3 py-2 text-sm font-mono">{item.hsCode || '—'}</div>
                ) : (
                  <input
                    type="text"
                    value={item.hsCode}
                    onChange={(e) => handleCellChange(item.id, 'hsCode', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                    data-col-index={1}
                    placeholder="0000"
                    maxLength={8}
                    className={cn(inputBaseClass, 'font-mono')}
                    aria-label="HS Code"
                    aria-invalid={!!errors.hsCode}
                  />
                )}
              </div>

              {/* Quantity */}
              <div className={cn('relative', cellClass)}>
                {isReadOnly ? (
                  <div className="px-3 py-2 text-sm text-right font-mono tabular-nums">
                    {item.quantity}
                  </div>
                ) : (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(e) => handleCellChange(item.id, 'quantity', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                    data-col-index={2}
                    placeholder="0"
                    className={cn(inputBaseClass, 'text-right font-mono tabular-nums')}
                    aria-label="Quantity"
                    aria-invalid={!!errors.quantity}
                  />
                )}
              </div>

              {/* Unit */}
              <div className={cn(cellClass)}>
                {isReadOnly ? (
                  <div className="px-3 py-2 text-sm">{item.unit}</div>
                ) : (
                  <select
                    value={item.unit}
                    onChange={(e) => handleCellChange(item.id, 'unit', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 3)}
                    data-col-index={3}
                    className={cn(
                      inputBaseClass,
                      'cursor-pointer',
                      isDark ? 'bg-slate-900' : 'bg-white'
                    )}
                    aria-label="Unit"
                  >
                    {LINE_ITEM_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.value}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unit Price */}
              <div className={cn('relative', cellClass)}>
                {isReadOnly ? (
                  <div className="px-3 py-2 text-sm text-right font-mono tabular-nums">
                    {item.unitPrice}
                  </div>
                ) : (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.unitPrice}
                    onChange={(e) => handleCellChange(item.id, 'unitPrice', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, 4)}
                    data-col-index={4}
                    placeholder="0.00"
                    className={cn(inputBaseClass, 'text-right font-mono tabular-nums')}
                    aria-label="Unit Price"
                    aria-invalid={!!errors.unitPrice}
                  />
                )}
              </div>

              {/* Line Total (calculated) */}
              <div className={cn('px-3 py-2 text-right', cellClass)}>
                <span
                  className={cn(
                    'font-mono text-sm tabular-nums font-medium',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )}
                >
                  {formatGridNumber(rowTotal)}
                </span>
              </div>

              {/* Delete Button */}
              <div className="px-1 py-2 flex justify-center">
                {!isReadOnly && lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(item.id)}
                    className={cn(
                      'p-1 rounded transition-colors',
                      isDark
                        ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/30'
                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                    )}
                    title="Remove row (Alt+D)"
                    aria-label="Remove row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Row Button */}
      {!isReadOnly && (
        <div className={cn('border-t', isDark ? 'border-slate-700' : 'border-slate-200')}>
          <button
            type="button"
            onClick={handleAddRow}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isDark
                ? 'text-cyan-400 hover:bg-slate-800'
                : 'text-teal-600 hover:bg-slate-50'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Line Item
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              (Alt+A)
            </span>
          </button>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {!isReadOnly && (
        <div
          className={cn(
            'px-4 py-2 text-xs border-t',
            isDark ? 'border-slate-700 text-slate-500 bg-slate-800/30' : 'border-slate-200 text-slate-400 bg-slate-50/50'
          )}
        >
          <span className="font-medium">Shortcuts:</span> Tab to navigate • Enter for next row • Alt+A add row • Alt+D delete row
        </div>
      )}
    </div>
  );
};

export default InvoiceLineItemsGrid;
