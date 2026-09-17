/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Database, Plus } from 'lucide-react';
import { Person, Transaction, TransactionType } from './types';
import {
  getStoredPeople,
  saveStoredPeople,
  getStoredTransactions,
  saveStoredTransactions,
  getTodayDateString,
} from './utils/storage';
import { HomeView } from './components/HomeView';
import { AccountView } from './components/AccountView';
import { PersonModal } from './components/PersonModal';
import { BackupModal } from './components/BackupModal';
import { AppLogo } from './components/AppLogo';

export default function App() {
  const [people, setPeople] = useState<Person[]>(() => getStoredPeople());
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredTransactions()
  );

  const [activeView, setActiveView] = useState<'home' | 'account'>('home');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Modals
  const [addPersonModalOpen, setAddPersonModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Persist people whenever changed
  useEffect(() => {
    saveStoredPeople(people);
  }, [people]);

  // Persist transactions whenever changed
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Selected person object
  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  // Add person handler
  const handleAddPerson = (data: {
    name: string;
    shopName?: string;
    phone?: string;
    note?: string;
    initialDue?: number;
  }) => {
    const newPersonId = `person_${Date.now()}`;
    const newPerson: Person = {
      id: newPersonId,
      name: data.name,
      shopName: data.shopName,
      phone: data.phone,
      note: data.note,
      createdAt: Date.now(),
    };

    const updatedPeople = [newPerson, ...people];
    setPeople(updatedPeople);

    // If initial due was specified, create the initial transaction
    if (data.initialDue && data.initialDue > 0) {
      const initialTx: Transaction = {
        id: `tx_${Date.now()}`,
        personId: newPersonId,
        amount: data.initialDue,
        type: 'add',
        date: getTodayDateString(),
        note: 'Opening due balance',
        createdAt: Date.now(),
      };
      setTransactions((prev) => [initialTx, ...prev]);
    }

    // Open their account view immediately
    setSelectedPersonId(newPersonId);
    setActiveView('account');
  };

  // Update person handler
  const handleUpdatePerson = (data: {
    name: string;
    shopName?: string;
    phone?: string;
    note?: string;
  }) => {
    if (!selectedPersonId) return;
    setPeople((prev) =>
      prev.map((p) => (p.id === selectedPersonId ? { ...p, ...data } : p))
    );
  };

  // Delete person handler
  const handleDeletePerson = (personId: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== personId));
    setTransactions((prev) => prev.filter((t) => t.personId !== personId));
    setActiveView('home');
    setSelectedPersonId(null);
  };

  // Add transaction handler
  const handleAddTransaction = (data: {
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
  }) => {
    if (!selectedPersonId) return;
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      personId: selectedPersonId,
      amount: data.amount,
      type: data.type,
      date: data.date,
      note: data.note,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Update transaction handler
  const handleUpdateTransaction = (
    txId: string,
    data: {
      amount: number;
      type: TransactionType;
      date: string;
      note?: string;
    }
  ) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, ...data } : t))
    );
  };

  // Delete transaction handler
  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  // Restore backup
  const handleRestoreBackup = (
    restoredPeople: Person[],
    restoredTransactions: Transaction[]
  ) => {
    setPeople(restoredPeople);
    setTransactions(restoredTransactions);
    setActiveView('home');
    setSelectedPersonId(null);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col antialiased">
      {/* App Header */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-white border-b border-stone-200/80 backdrop-blur-md px-4 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            id="brand-logo-btn"
            type="button"
            onClick={() => {
              setActiveView('home');
              setSelectedPersonId(null);
            }}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition-opacity"
          >
            <AppLogo size={36} className="h-9 w-9" />
            <div>
              <div className="text-base font-bold tracking-tight text-stone-900 flex items-center gap-1.5 leading-tight">
                <span>Personal Money Ledger</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                Due money & payment notebook
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5">
            {activeView === 'home' && (
              <button
                id="header-add-person-btn"
                type="button"
                onClick={() => setAddPersonModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Person</span>
              </button>
            )}

            <button
              id="btn-open-backup-modal"
              type="button"
              onClick={() => setBackupModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 transition-colors"
              title="Backup & Restore Data"
            >
              <Database className="h-3.5 w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeView === 'home' || !selectedPerson ? (
          <HomeView
            people={people}
            transactions={transactions}
            onSelectPerson={(id) => {
              setSelectedPersonId(id);
              setActiveView('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddPerson={() => setAddPersonModalOpen(true)}
          />
        ) : (
          <AccountView
            person={selectedPerson}
            transactions={transactions}
            onBack={() => {
              setActiveView('home');
              setSelectedPersonId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdatePerson={handleUpdatePerson}
            onDeletePerson={handleDeletePerson}
          />
        )}
      </main>

      {/* Add Person Modal */}
      <PersonModal
        isOpen={addPersonModalOpen}
        onClose={() => setAddPersonModalOpen(false)}
        onSave={handleAddPerson}
      />

      {/* Backup Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        people={people}
        transactions={transactions}
        onClose={() => setBackupModalOpen(false)}
        onRestore={handleRestoreBackup}
      />
    </div>
  );
}
