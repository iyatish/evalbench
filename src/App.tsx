import { useState, useCallback } from 'react';
import { GlobeView } from './components/GlobeView';
import { EventPanel } from './components/EventPanel';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { useGdeltEvents } from './hooks/useGdeltEvents';
import { CountryEvent, Filters } from './types';

const DEFAULT_FILTERS: Filters = {
  category: 'all',
  timespan: '24h',
};

export function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<CountryEvent | null>(null);

  const { events, loading, error, refetch } = useGdeltEvents(filters);

  const handleSelect = useCallback((country: CountryEvent | null) => {
    setSelected(country);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950">
      {/* Starfield background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, #0f172a 0%, #030712 70%)',
        }}
      />

      <GlobeView events={events} onCountrySelect={handleSelect} panelOpen={!!selected} />

      <Header eventCount={events.length} loading={loading} error={error} />

      <FilterBar filters={filters} onChange={setFilters} loading={loading} onRefresh={refetch} />

      {/* Heat legend */}
      <div className="absolute left-5 bottom-6 z-10 bg-gray-900/80 backdrop-blur-sm border border-gray-700/60 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
        <p className="text-gray-500 text-xs font-medium mb-0.5">Event density</p>
        {[
          { color: 'bg-cyan-400', label: 'Low' },
          { color: 'bg-green-400', label: 'Moderate' },
          { color: 'bg-yellow-400', label: 'High' },
          { color: 'bg-orange-400', label: 'Very high' },
          { color: 'bg-red-500', label: 'Extreme' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <span className="text-gray-400 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {selected && <EventPanel country={selected} onClose={handleClose} />}
    </div>
  );
}
