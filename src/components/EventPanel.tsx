import { X, ExternalLink, Clock, Globe } from 'lucide-react';
import { CountryEvent } from '../types';

interface Props {
  country: CountryEvent;
  onClose: () => void;
}

function formatDate(seendate: string): string {
  try {
    // GDELT format: 20240108T120000Z
    const iso = seendate.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
      '$1-$2-$3T$4:$5:$6Z'
    );
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return seendate;
  }
}

function heatLabel(count: number, max: number): { label: string; color: string } {
  const ratio = count / max;
  if (ratio < 0.2) return { label: 'Low activity', color: 'text-cyan-400' };
  if (ratio < 0.5) return { label: 'Moderate activity', color: 'text-green-400' };
  if (ratio < 0.75) return { label: 'High activity', color: 'text-yellow-400' };
  return { label: 'Very high activity', color: 'text-red-400' };
}

export function EventPanel({ country, onClose }: Props) {
  const heat = heatLabel(country.count, Math.max(country.count, 10));

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/60 overflow-hidden flex flex-col z-10">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700/60 p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-base truncate">{country.countryName}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-400 text-xs">{country.count} events</span>
            <span className={`text-xs font-medium ${heat.color}`}>· {heat.label}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {country.articles.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-8">No articles available.</p>
        )}
        {country.articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg p-3 transition-all"
          >
            <p className="text-white text-sm leading-snug line-clamp-3 group-hover:text-blue-400 transition-colors">
              {article.title}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 min-w-0 truncate">
                <Globe size={10} className="shrink-0" />
                <span className="truncate">{article.domain}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock size={10} />
                {formatDate(article.seendate)}
              </span>
              <ExternalLink
                size={10}
                className="ml-auto shrink-0 text-gray-600 group-hover:text-blue-400 transition-colors"
              />
            </div>
          </a>
        ))}
      </div>

      {/* Footer note */}
      <div className="border-t border-gray-700/60 px-4 py-2">
        <p className="text-gray-600 text-xs">Source: GDELT Project</p>
      </div>
    </div>
  );
}
