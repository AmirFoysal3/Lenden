import { Person, Transaction, PersonWithSummary } from '../types';

const STORAGE_KEY_PEOPLE = 'money_ledger_people_v1';
const STORAGE_KEY_TRANSACTIONS = 'money_ledger_transactions_v1';

export const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person_1',
    name: 'Rahim Store',
    shopName: 'Rahim General Store',
    phone: '01712-345678',
    note: 'Wholesale customer near main bazaar',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'person_2',
    name: 'Karim',
    shopName: '',
    phone: '01823-456789',
    note: 'Friend from college',
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'person_3',
    name: 'Hasan',
    shopName: 'Hasan Tea Stall',
    phone: '01934-567890',
    note: 'Corner shop',
    createdAt: Date.now() - 5 * 86400000,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Rahim Store: 6200 added - 700 paid = 5500
  {
    id: 'tx_1',
    personId: 'person_1',
    amount: 5200,
    type: 'add',
    date: '2026-09-15',
    note: 'Product delivery & goods',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'tx_2',
    personId: 'person_1',
    amount: 700,
    type: 'payment',
    date: '2026-09-12',
    note: 'Payment received via cash',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'tx_3',
    personId: 'person_1',
    amount: 1000,
    type: 'add',
    date: '2026-09-17',
    note: 'Goods taken',
    createdAt: Date.now() - 86400000,
  },

  // Karim: 2500 added - 500 paid = 2000
  {
    id: 'tx_4',
    personId: 'person_2',
    amount: 2500,
    type: 'add',
    date: '2026-09-10',
    note: 'Emergency cash loan',
    createdAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'tx_5',
    personId: 'person_2',
    amount: 500,
    type: 'payment',
    date: '2026-09-14',
    note: 'Partial cash returned',
    createdAt: Date.now() - 4 * 86400000,
  },

  // Hasan: 850 added = 850
  {
    id: 'tx_6',
    personId: 'person_3',
    amount: 850,
    type: 'add',
    date: '2026-09-16',
    note: 'Store grocery bill due',
    createdAt: Date.now() - 2 * 86400000,
  },
];

export function getStoredPeople(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEOPLE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(INITIAL_PEOPLE));
      return INITIAL_PEOPLE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse people from storage', e);
    return INITIAL_PEOPLE;
  }
}

export function saveStoredPeople(people: Person[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(people));
  } catch (e) {
    console.error('Failed to save people to storage', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse transactions from storage', e);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to storage', e);
  }
}

export function formatTaka(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  if (amount < 0) {
    return `- ৳${formatted}`;
  }
  return `৳${formatted}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayNum = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNum} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computePersonSummary(person: Person, transactions: Transaction[]): PersonWithSummary {
  const personTxs = transactions.filter((t) => t.personId === person.id);
  let totalAdded = 0;
  let totalPaid = 0;
  let lastDate: string | undefined;

  // Sort by date descending
  const sorted = [...personTxs].sort((a, b) => {
    const dComp = b.date.localeCompare(a.date);
    if (dComp !== 0) return dComp;
    return b.createdAt - a.createdAt;
  });

  if (sorted.length > 0) {
    lastDate = sorted[0].date;
  }

  for (const t of personTxs) {
    if (t.type === 'add') {
      totalAdded += t.amount;
    } else if (t.type === 'payment') {
      totalPaid += t.amount;
    }
  }

  const currentBalance = totalAdded - totalPaid;

  return {
    ...person,
    totalAdded,
    totalPaid,
    currentBalance,
    transactionCount: personTxs.length,
    lastTransactionDate: lastDate,
  };
}
