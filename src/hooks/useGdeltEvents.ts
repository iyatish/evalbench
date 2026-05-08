import { useState, useEffect, useCallback } from 'react';
import { CountryEvent, Filters, NewsArticle } from '../types';
import { COUNTRIES, resolveCountryCode } from '../data/countries';

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Ordered list of CORS proxies — tried in sequence on failure
const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
];

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const CATEGORY_QUERIES: Record<string, string> = {
  all: 'world OR international OR global OR national',
  politics: 'election OR government OR parliament OR diplomacy OR president OR minister OR senate',
  conflict: 'war OR conflict OR military OR attack OR troops OR battle OR ceasefire OR airstrike',
  economy: 'economy OR markets OR inflation OR trade OR GDP OR recession OR finance OR stocks',
  disasters: 'earthquake OR flood OR hurricane OR wildfire OR tsunami OR disaster OR drought OR storm',
  science: 'climate OR technology OR research OR space OR artificial intelligence OR science OR breakthrough',
};

const TIMESPAN_MAP: Record<string, string> = {
  '1h': '60min',
  '24h': '1440min',
  '7d': '10080min',
};

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  socialimage?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

interface CacheEntry {
  ts: number;
  events: CountryEvent[];
}

function cacheKey(filters: Filters) {
  return `globepulse:${filters.category}:${filters.timespan}`;
}

function readCache(filters: Filters): CountryEvent[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(filters));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.events;
  } catch {
    return null;
  }
}

function writeCache(filters: Filters, events: CountryEvent[]) {
  try {
    sessionStorage.setItem(cacheKey(filters), JSON.stringify({ ts: Date.now(), events }));
  } catch {
    // sessionStorage full — silently ignore
  }
}

function buildGdeltUrl(filters: Filters): string {
  const query = CATEGORY_QUERIES[filters.category] ?? CATEGORY_QUERIES.all;
  const timespan = TIMESPAN_MAP[filters.timespan] ?? '1440min';
  const params = new URLSearchParams({
    query,
    mode: 'artlist',
    maxrecords: '250',
    format: 'json',
    timespan,
    sourcelang: 'english',
  });
  return `${GDELT_BASE}?${params.toString()}`;
}

async function fetchWithFallback(gdeltUrl: string): Promise<GdeltResponse> {
  let lastErr: unknown;
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(gdeltUrl));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json() as GdeltResponse;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

function aggregateByCountry(articles: GdeltArticle[]): CountryEvent[] {
  const byCode = new Map<string, { count: number; articles: NewsArticle[] }>();

  for (const article of articles) {
    if (!article.sourcecountry) continue;
    const code = resolveCountryCode(article.sourcecountry);
    if (!code || !COUNTRIES[code]) continue;

    const entry = byCode.get(code) ?? { count: 0, articles: [] };
    entry.count += 1;
    if (entry.articles.length < 5) {
      entry.articles.push({
        url: article.url,
        title: article.title,
        seendate: article.seendate,
        domain: article.domain,
        language: article.language,
        sourcecountry: article.sourcecountry,
        image: article.socialimage,
      });
    }
    byCode.set(code, entry);
  }

  return Array.from(byCode.entries()).map(([code, data]) => ({
    countryCode: code,
    countryName: COUNTRIES[code].name,
    lat: COUNTRIES[code].lat,
    lng: COUNTRIES[code].lng,
    count: data.count,
    articles: data.articles,
  }));
}

export function useGdeltEvents(filters: Filters) {
  const [events, setEvents] = useState<CountryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async (bustCache = false) => {
    if (!bustCache) {
      const cached = readCache(filters);
      if (cached) {
        setEvents(cached);
        setLoading(false);
        setError(null);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithFallback(buildGdeltUrl(filters));
      const result = aggregateByCountry(data.articles ?? []);
      writeCache(filters, result);
      setEvents(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.timespan]);

  useEffect(() => {
    fetch_();
    const timer = setInterval(() => fetch_(true), CACHE_TTL_MS);
    return () => clearInterval(timer);
  }, [fetch_]);

  return { events, loading, error, refetch: () => fetch_(true) };
}
