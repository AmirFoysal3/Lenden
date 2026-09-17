import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Phone,
  Store,
  FileText,
  Calendar,
  User,
} from 'lucide-react';
import { Person, Transaction, TransactionType } from '../types';
import {
  formatTaka,
  formatDateDisplay,
  computePersonSummary,
} from '../utils/storage';
import { TransactionModal } from './TransactionModal';
import { ConfirmModal } from './ConfirmModal';
import { PersonModal } from './PersonModal';

interface AccountViewProps {
  person: Person;
  transactions: Transaction[];
  onBack: () => void;
  onAddTransaction: (tx: {
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
  }) => void;
  onUpdateTransaction: (
    id: string,
    tx: {
      amount: number;
      type: TransactionType;
      date: string;
      note?: string;
    }
  ) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdatePerson: (data: {
    name: string;
    shopName?: string;
    phone?: string;
    note?: string;
  }) => void;
  onDeletePerson: (id: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  person,
  transactions,
  onBack,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdatePerson,
  onDeletePerson,
}) => {
  // Modal states
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('add');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [deletePersonConfirmOpen, setDeletePersonConfirmOpen] = useState(false);

  const [deleteTxConfirm, setDeleteTxConfirm] = useState<{
    id: string;
    amount: number;
    date: string;
  } | null>(null);

  // Filter transactions for this person
  const personTransactions = transactions.filter((t) => t.personId === person.id);

  // Compute summary metrics
  const summary = computePersonSummary(person, transactions);

  // Sort transactions by date descending, then createdAt descending
  const sortedTransactions = [...personTransactions].sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    if (dateComp !== 0) return dateComp;
    return b.createdAt - a.createdAt;
  });

  const handleOpenAddMoney = () => {
    setEditingTx(null);
    setTxModalType('add');
    setTxModalOpen(true);
  };

  const handleOpenReceivePayment = () => {
    setEditingTx(null);
    setTxModalType('payment');
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalType(tx.type);
    setTxModalOpen(true);
  };

  const handleSaveTx = (data: {
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
  }) => {
    if (editingTx) {
      onUpdateTransaction(editingTx.id, data);
    } else {
      onAddTransaction(data);
    }
  };

  return (
    <div id="account-view" className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-to-home"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Accounts</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-edit-person"
            type="button"
            onClick={() => setEditPersonOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 transition-colors"
            title="Edit contact information"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Account</span>
          </button>
          <button
            id="btn-delete-person"
            type="button"
            onClick={() => setDeletePersonConfirmOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 transition-colors"
            title="Delete this entire account"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Account Info Card */}
      <div
        id="account-header-card"
        className="rounded-xl bg-white border border-stone-200 p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 id="account-person-name" className="text-2xl font-bold text-stone-900">
                {person.name}
              </h1>
              {person.shopName && (
                <span
                  id="account-shop-badge"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200"
                >
                  <Store className="h-3 w-3" />
                  {person.shopName}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-600">
              {person.phone && (
                <a
                  id="account-phone-link"
                  href={`tel:${person.phone}`}
                  className="inline-flex items-center gap-1 hover:text-emerald-700 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5 text-stone-400" />
                  <span>{person.phone}</span>
                </a>
              )}
              {person.note && (
                <span id="account-note-text" className="inline-flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-stone-400" />
                  <span>{person.note}</span>
                </span>
              )}
              <span className="text-stone-400">
                {summary.transactionCount} transaction{summary.transactionCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Balance Display Card */}
      <div
        id="balance-highlight-card"
        className={`rounded-xl border p-6 shadow-xs ${
          summary.currentBalance > 0
            ? 'bg-amber-50/50 border-amber-200/80'
            : summary.currentBalance === 0
            ? 'bg-emerald-50/40 border-emerald-200/80'
            : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            {summary.currentBalance > 0
              ? 'Current Due Balance (Owed to Me)'
              : summary.currentBalance === 0
              ? 'Account Balance (All Cleared)'
              : 'Advance / Overpaid Balance'}
          </p>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div id="account-current-balance-display">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Current Balance: {formatTaka(summary.currentBalance)}
              </span>
            </div>

            {summary.currentBalance === 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 self-center sm:self-auto">
                ✓ Fully Settled
              </span>
            )}
          </div>

          {/* Detailed Calculation Breakdown */}
          <div className="mt-4 pt-4 border-t border-stone-200/70 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/80 p-3 rounded-lg border border-stone-200/60">
              <span className="text-xs text-stone-500 block">Total Added (Goods/Loans):</span>
              <span
                id="summary-total-added"
                className="text-base font-bold text-stone-900 mt-0.5 block"
              >
                {formatTaka(summary.totalAdded)}
              </span>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-stone-200/60">
              <span className="text-xs text-stone-500 block">Total Payments Received:</span>
              <span
                id="summary-total-paid"
                className="text-base font-bold text-emerald-700 mt-0.5 block"
              >
                {formatTaka(summary.totalPaid)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Action Buttons: Side by Side */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          id="btn-add-money-trigger"
          type="button"
          onClick={handleOpenAddMoney}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>+ Add Money</span>
        </button>

        <button
          id="btn-receive-payment-trigger"
          type="button"
          onClick={handleOpenReceivePayment}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-base shadow-xs transition-colors cursor-pointer"
        >
          <Minus className="h-5 w-5 stroke-[2.5]" />
          <span>− Receive Payment</span>
        </button>
      </div>

      {/* Complete Transaction History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 id="tx-history-title" className="text-base font-bold text-stone-900">
            Transaction History ({sortedTransactions.length})
          </h2>
          <span className="text-xs text-stone-500">Date order (newest first)</span>
        </div>

        {sortedTransactions.length === 0 ? (
          <div
            id="empty-tx-history"
            className="rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-8 text-center"
          >
            <Calendar className="h-8 w-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No transactions recorded yet</p>
            <p className="text-xs text-stone-500 mt-1">
              Click <span className="font-semibold text-emerald-700">+ Add Money</span> to record goods taken or loans,
              or <span className="font-semibold text-sky-700">− Receive Payment</span> when they pay back.
            </p>
          </div>
        ) : (
          <div id="tx-list-container" className="space-y-2.5">
            {sortedTransactions.map((tx) => {
              const isAdd = tx.type === 'add';
              return (
                <div
                  key={tx.id}
                  id={`tx-row-${tx.id}`}
                  className="rounded-xl bg-white border border-stone-200 p-4 shadow-2xs hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Date header */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-700">
                          {formatDateDisplay(tx.date)}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.2 rounded text-[11px] font-semibold ${
                            isAdd
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-sky-100 text-sky-900'
                          }`}
                        >
                          {isAdd ? 'Money Added (Due Increased)' : 'Payment Received'}
                        </span>
                      </div>

                      {/* Amount and Note display matching example: "৳1,000 — Goods taken" or "− ৳700 — Payment received" */}
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span
                          className={`text-lg font-bold tracking-tight ${
                            isAdd ? 'text-stone-900' : 'text-sky-800'
                          }`}
                        >
                          {isAdd ? `+ ${formatTaka(tx.amount)}` : `− ${formatTaka(tx.amount)}`}
                        </span>
                        {tx.note && (
                          <span className="text-sm text-stone-600">
                            — {tx.note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        id={`btn-edit-tx-${tx.id}`}
                        type="button"
                        onClick={() => handleEditTx(tx)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        id={`btn-delete-tx-${tx.id}`}
                        type="button"
                        onClick={() =>
                          setDeleteTxConfirm({
                            id: tx.id,
                            amount: tx.amount,
                            date: tx.date,
                          })
                        }
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal for Add or Edit */}
      <TransactionModal
        isOpen={txModalOpen}
        personName={person.name}
        defaultType={txModalType}
        editingTransaction={editingTx}
        onClose={() => {
          setTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTx}
      />

      {/* Person Edit Modal */}
      <PersonModal
        isOpen={editPersonOpen}
        initialPerson={person}
        onClose={() => setEditPersonOpen(false)}
        onSave={onUpdatePerson}
      />

      {/* Delete Transaction Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteTxConfirm)}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this transaction of ${
          deleteTxConfirm ? formatTaka(deleteTxConfirm.amount) : ''
        } on ${deleteTxConfirm ? formatDateDisplay(deleteTxConfirm.date) : ''}? The balance will update automatically.`}
        confirmLabel="Delete Transaction"
        onConfirm={() => {
          if (deleteTxConfirm) {
            onDeleteTransaction(deleteTxConfirm.id);
            setDeleteTxConfirm(null);
          }
        }}
        onCancel={() => setDeleteTxConfirm(null)}
      />

      {/* Delete Person Confirmation */}
      <ConfirmModal
        isOpen={deletePersonConfirmOpen}
        title={`Delete Account for ${person.name}?`}
        message={`Are you sure you want to delete ${person.name}'s account and all their transaction records? This action cannot be undone.`}
        confirmLabel="Delete Account"
        onConfirm={() => {
          setDeletePersonConfirmOpen(false);
          onDeletePerson(person.id);
        }}
        onCancel={() => setDeletePersonConfirmOpen(false)}
      />
    </div>
  );
};
