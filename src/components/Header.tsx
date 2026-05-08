interface Props {
  eventCount: number;
  loading: boolean;
  error: string | null;
}

export function Header({ eventCount, loading, error }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 pointer-events-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <span className="text-2xl">🌍</span>
        <div>
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">
            GlobePulse
          </h1>
          <p className="text-gray-500 text-xs">Real-time world news events</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {error && (
          <span className="text-red-400 text-xs bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
            {error}
          </span>
        )}
        {loading ? (
          <span className="flex items-center gap-2 text-gray-400 text-xs bg-gray-900/80 backdrop-blur-sm border border-gray-700/60 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Fetching events…
          </span>
        ) : (
          <span className="flex items-center gap-2 text-gray-400 text-xs bg-gray-900/80 backdrop-blur-sm border border-gray-700/60 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {eventCount} {eventCount === 1 ? 'country' : 'countries'} tracked
          </span>
        )}
      </div>
    </div>
  );
}
