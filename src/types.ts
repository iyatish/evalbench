export interface NewsArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  image?: string;
}

export interface CountryEvent {
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
  count: number;
  articles: NewsArticle[];
}

export type Category = 'all' | 'politics' | 'conflict' | 'economy' | 'disasters' | 'science';
export type Timespan = '1h' | '24h' | '7d';

export interface Filters {
  category: Category;
  timespan: Timespan;
}
