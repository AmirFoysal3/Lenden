import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getTodayDateString } from '../utils/storage';

interface TransactionModalProps {
  isOpen: boolean;
  personName: string;
  defaultType?: TransactionType;
  editingTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  personName,
  defaultType = 'add',
  editingTransaction,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date || getTodayDateString());
      setNote(editingTransaction.note || '');
    } else {
      setType(defaultType);
      setAmount('');
      setDate(getTodayDateString());
      setNote('');
    }
    setError('');
  }, [editingTransaction, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount.trim() || isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      setError('Please select a date.');
      return;
    }

    onSave({
      amount: num,
      type,
      date,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const isEditing = Boolean(editingTransaction);

  const quickNotes =
    type === 'add'
      ? ['Goods taken', 'Product sale', 'Cash loan', 'Grocery due', 'Store purchase']
      : ['Payment received', 'Cash payment', 'Partial payment', 'Full settlement', 'Paid in store'];

  return (
    <div
      id="tx-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="tx-modal-container"
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 bg-stone-50">
          <div>
            <h2 id="tx-modal-title" className="text-base font-semibold text-stone-900">
              {isEditing
                ? 'Edit Transaction'
                : type === 'add'
                ? '+ Add Money (They owe more)'
                : '− Receive Payment (Paid back)'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Account: {personName}</p>
          </div>
          <button
            id="btn-close-tx-modal"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              id="tx-form-error"
              className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 border border-red-200"
            >
              {error}
            </div>
          )}

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-lg">
              <button
                type="button"
                id="tab-select-add"
                onClick={() => setType('add')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                  type === 'add'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Money</span>
              </button>
              <button
                type="button"
                id="tab-select-payment"
                onClick={() => setType('payment')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                  type === 'payment'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Minus className="h-4 w-4" />
                <span>− Receive Payment</span>
              </button>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              {type === 'add'
                ? 'Adds to the total money they owe you (increases balance).'
                : 'Deducts money received from them (decreases balance).'}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="tx-amount-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Amount (৳) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-stone-600 font-bold text-lg">৳</span>
              <input
                id="tx-amount-input"
                type="number"
                step="any"
                min="0"
                required
                placeholder="e.g. 1000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-lg border border-stone-300 pl-9 pr-3.5 py-2.5 text-stone-900 font-semibold text-base focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                autoFocus
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="tx-date-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="tx-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Note / Reason */}
          <div>
            <label
              htmlFor="tx-note-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Note / Reason <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="tx-note-input"
              type="text"
              placeholder={type === 'add' ? 'e.g. Goods taken, Product' : 'e.g. Cash payment received'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />

            {/* Quick Note Pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickNotes.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setNote(quick)}
                  className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              id="btn-cancel-tx"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-tx"
              type="submit"
              className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors shadow-xs ${
                type === 'add'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-sky-700 hover:bg-sky-800'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
