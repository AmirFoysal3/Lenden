import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Phone, Store, ChevronRight, X, User } from 'lucide-react';
import { Person, Transaction, PersonWithSummary } from '../types';
import { formatTaka, computePersonSummary } from '../utils/storage';
import { AppLogo } from './AppLogo';

interface HomeViewProps {
  people: Person[];
  transactions: Transaction[];
  onSelectPerson: (personId: string) => void;
  onOpenAddPerson: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  people,
  transactions,
  onSelectPerson,
  onOpenAddPerson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'due' | 'settled'>('all');

  // Compute summary for every person
  const peopleWithSummaries: PersonWithSummary[] = useMemo(() => {
    return people.map((p) => computePersonSummary(p, transactions));
  }, [people, transactions]);

  // Overall metrics:
  // "Total Money Owed to Me: ৳8,350"
  const totalMoneyOwedToMe = useMemo(() => {
    return peopleWithSummaries.reduce((sum, p) => {
      // Sum positive balances (money owed to me)
      return p.currentBalance > 0 ? sum + p.currentBalance : sum;
    }, 0);
  }, [peopleWithSummaries]);

  const activeOwingCount = useMemo(() => {
    return peopleWithSummaries.filter((p) => p.currentBalance > 0).length;
  }, [peopleWithSummaries]);

  // Search and filter
  const filteredPeople = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return peopleWithSummaries.filter((person) => {
      // Search match
      const nameMatch = person.name.toLowerCase().includes(query);
      const shopMatch = person.shopName?.toLowerCase().includes(query) || false;
      const phoneMatch = person.phone?.toLowerCase().includes(query) || false;
      const matchesSearch = query === '' || nameMatch || shopMatch || phoneMatch;

      if (!matchesSearch) return false;

      // Filter match
      if (filterType === 'due') {
        return person.currentBalance > 0;
      }
      if (filterType === 'settled') {
        return person.currentBalance <= 0;
      }
      return true;
    });
  }, [peopleWithSummaries, searchQuery, filterType]);

  return (
    <div id="home-view" className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner Card: Total Money Owed to Me */}
      <div
        id="dashboard-total-card"
        className="rounded-xl bg-stone-900 text-white p-6 shadow-md border border-stone-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <AppLogo size={48} className="h-12 w-12 rounded-xl" />
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-300 font-semibold">
                Personal Money Ledger
              </p>
              <h1 id="total-money-owed-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                Total Money Owed to Me: {formatTaka(totalMoneyOwedToMe)}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                {activeOwingCount} {activeOwingCount === 1 ? 'person/shop has' : 'people/shops have'} pending balance
              </p>
            </div>
          </div>

          <button
            id="btn-add-person-hero"
            type="button"
            onClick={onOpenAddPerson}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Add New Person</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search by person name, shop name, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Accounts ({people.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('due')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'due'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Has Due ({activeOwingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('settled')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'settled'
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Settled / ৳0 ({people.length - activeOwingCount})
          </button>
        </div>
      </div>

      {/* People / Shopkeepers List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 id="ledger-list-title" className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            Accounts & Balances
          </h2>
          <span className="text-xs text-stone-400">Tap any account to view or add money</span>
        </div>

        {filteredPeople.length === 0 ? (
          <div
            id="empty-people-state"
            className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center"
          >
            <User className="h-8 w-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">
              {searchQuery ? 'No person or shop matches your search' : 'No accounts added yet'}
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try checking for typos or clear your search query.'
                : 'Add the first person or shopkeeper who owes you money to start tracking.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAddPerson}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Add New Person</span>
              </button>
            )}
          </div>
        ) : (
          <div id="people-list-container" className="space-y-2.5">
            {filteredPeople.map((person) => {
              const owesMoney = person.currentBalance > 0;
              const isSettled = person.currentBalance === 0;

              return (
                <div
                  key={person.id}
                  id={`person-card-${person.id}`}
                  onClick={() => onSelectPerson(person.id)}
                  className="group rounded-xl bg-white border border-stone-200 hover:border-stone-400 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors truncate">
                        {person.name}
                      </span>
                      {person.shopName && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          <Store className="h-3 w-3 text-stone-500" />
                          {person.shopName}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
                      {person.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-stone-400" />
                          <span>{person.phone}</span>
                        </span>
                      )}
                      {person.note && (
                        <span className="truncate max-w-[200px] text-stone-400">
                          {person.note}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Current total amount they owe me */}
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <div
                        id={`balance-display-${person.id}`}
                        className={`text-lg font-bold tracking-tight ${
                          owesMoney
                            ? 'text-stone-900'
                            : isSettled
                            ? 'text-stone-500'
                            : 'text-stone-700'
                        }`}
                      >
                        {formatTaka(person.currentBalance)}
                      </div>
                      <div className="text-[11px] font-medium">
                        {owesMoney ? (
                          <span className="text-amber-700 font-semibold">Owed to you</span>
                        ) : isSettled ? (
                          <span className="text-emerald-700">Settled (৳0)</span>
                        ) : (
                          <span className="text-stone-500">Advance</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-stone-300 group-hover:text-stone-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
