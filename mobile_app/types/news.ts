export type NewsCategory = 'all' | 'business' | 'technology' | 'health' | 'science' | 'sports' | 'entertainment';

export interface NewsItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    source: string;
    url: string;
    publishedAt: string;
    category: string;
    content: string;
}