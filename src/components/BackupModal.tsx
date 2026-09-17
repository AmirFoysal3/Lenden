import React, { useState } from 'react';
import { X, Download, Upload, Check, RefreshCw } from 'lucide-react';
import { Person, Transaction } from '../types';
import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  people: Person[];
  transactions: Transaction[];
  onClose: () => void;
  onRestore: (people: Person[], transactions: Transaction[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  people,
  transactions,
  onClose,
  onRestore,
}) => {
  const [copied, setCopied] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  if (!isOpen) return null;

  const handleExportFile = () => {
    const backupData = {
      version: 1,
      appName: 'Personal Money Ledger',
      exportedAt: new Date().toISOString(),
      people,
      transactions,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `money_ledger_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.people) && Array.isArray(parsed.transactions)) {
          onRestore(parsed.people, parsed.transactions);
          setRestoreMessage('Backup successfully restored!');
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setRestoreMessage('Invalid backup format.');
        }
      } catch (err) {
        setRestoreMessage('Error reading JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    onRestore(INITIAL_PEOPLE, INITIAL_TRANSACTIONS);
    setRestoreMessage('Reset to original sample data.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div
      id="backup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div
        id="backup-modal-container"
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 bg-stone-50">
          <h2 id="backup-modal-title" className="text-base font-semibold text-stone-900">
            Data Backup & Storage
          </h2>
          <button
            id="btn-close-backup-modal"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-stone-700">
          <p className="text-xs text-stone-500">
            All your ledger accounts and transactions are automatically saved in your browser storage.
            You can also export a copy to keep a physical file backup.
          </p>

          {restoreMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 font-medium">
              {restoreMessage}
            </div>
          )}

          <div className="space-y-2">
            <button
              id="btn-export-backup"
              type="button"
              onClick={handleExportFile}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white py-2.5 px-4 font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Backup File (.json)</span>
            </button>

            <label
              id="btn-restore-backup"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 py-2.5 px-4 font-medium transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 text-stone-500" />
              <span>Restore from Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Need sample data?</span>
            <button
              type="button"
              onClick={handleResetSampleData}
              className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Sample Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
