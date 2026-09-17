import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Person } from '../types';
import { getTodayDateString } from '../utils/storage';

interface PersonModalProps {
  isOpen: boolean;
  initialPerson?: Person | null;
  onClose: () => void;
  onSave: (personData: {
    name: string;
    shopName?: string;
    phone?: string;
    note?: string;
    initialDue?: number;
  }) => void;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  initialPerson,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [initialDue, setInitialDue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPerson) {
      setName(initialPerson.name || '');
      setShopName(initialPerson.shopName || '');
      setPhone(initialPerson.phone || '');
      setNote(initialPerson.note || '');
      setInitialDue('');
    } else {
      setName('');
      setShopName('');
      setPhone('');
      setNote('');
      setInitialDue('');
    }
    setError('');
  }, [initialPerson, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Person name is required.');
      return;
    }

    const dueNum = initialDue.trim() ? parseFloat(initialDue) : 0;
    if (initialDue.trim() && (isNaN(dueNum) || dueNum < 0)) {
      setError('Initial due amount must be a valid positive number.');
      return;
    }

    onSave({
      name: name.trim(),
      shopName: shopName.trim() || undefined,
      phone: phone.trim() || undefined,
      note: note.trim() || undefined,
      initialDue: dueNum > 0 ? dueNum : undefined,
    });
    onClose();
  };

  const isEditing = Boolean(initialPerson);

  return (
    <div
      id="person-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="person-modal-container"
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 bg-stone-50">
          <h2 id="person-modal-title" className="text-base font-semibold text-stone-900">
            {isEditing ? 'Edit Person / Shop Details' : 'Add New Person or Shop'}
          </h2>
          <button
            id="btn-close-person-modal"
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
              id="person-form-error"
              className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 border border-red-200"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="person-name-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="person-name-input"
              type="text"
              required
              placeholder="e.g. Rahim or Karim"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="person-shop-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Shop Name <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="person-shop-input"
              type="text"
              placeholder="e.g. Rahim Store, Hasan Tea Stall"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label
              htmlFor="person-phone-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Phone Number <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <input
              id="person-phone-input"
              type="tel"
              placeholder="e.g. 01712-345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {!isEditing && (
            <div>
              <label
                htmlFor="person-initial-due-input"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
              >
                Opening Due Balance (৳){' '}
                <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-stone-500 font-medium">৳</span>
                <input
                  id="person-initial-due-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={initialDue}
                  onChange={(e) => setInitialDue(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 pl-8 pr-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <p className="mt-1 text-xs text-stone-500">
                If they already owe you money right now, enter it here. You can also add it later.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="person-note-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1"
            >
              Note <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="person-note-input"
              rows={2}
              placeholder="e.g. Wholesale customer, neighbor, colleague..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              id="btn-cancel-person-modal"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-save-person"
              type="submit"
              className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition-colors shadow-xs"
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
