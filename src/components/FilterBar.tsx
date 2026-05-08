import { RefreshCw } from 'lucide-react';
import { Category, Filters, Timespan } from '../types';

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌐' },
  { value: 'politics', label: 'Politics', emoji: '🏛️' },
  { value: 'conflict', label: 'Conflict', emoji: '⚔️' },
  { value: 'economy', label: 'Economy', emoji: '📈' },
  { value: 'disasters', label: 'Disasters', emoji: '🌪️' },
  { value: 'science', label: 'Science', emoji: '🔬' },
];

const TIMESPANS: { value: Timespan; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function FilterBar({ filters, onChange, loading, onRefresh }: Props) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
      {/* Category pills */}
      <div className="flex gap-1 bg-gray-900/90 backdrop-blur-sm border border-gray-700/60 rounded-2xl p-1.5 shadow-xl">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange({ ...filters, category: cat.value })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filters.category === cat.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Timespan + refresh */}
      <div className="flex gap-2 items-center">
        <div className="flex bg-gray-900/90 backdrop-blur-sm border border-gray-700/60 rounded-xl p-1 shadow-xl">
          {TIMESPANS.map((ts) => (
            <button
              key={ts.value}
              onClick={() => onChange({ ...filters, timespan: ts.value })}
              className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                filters.timespan === ts.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh events"
          className="p-2 bg-gray-900/90 backdrop-blur-sm border border-gray-700/60 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-40 shadow-xl"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
}
