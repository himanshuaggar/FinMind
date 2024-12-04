export const NEWS_CATEGORIES = [
    { id: 'all', label: 'All News', icon: 'rss-feed' },
    { id: 'business', label: 'Business', icon: 'business' },
    { id: 'technology', label: 'Technology', icon: 'computer' },
    { id: 'health', label: 'Health', icon: 'local-hospital' },
    { id: 'science', label: 'Science', icon: 'science' },
    { id: 'sports', label: 'Sports', icon: 'sports' },
    { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
] as const;

export const MOCK_NEWS = [
    {
        id: '1',
        title: 'Apple Announces Revolutionary AI Features',
        description: 'Apple unveils groundbreaking AI features for iOS, potentially impacting the entire tech industry and setting new standards for mobile AI applications.',
        category: 'technology',
        imageUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc',
        source: 'TechCrunch',
        sourceIcon: 'https://techcrunch.com/favicon.ico',
        timeAgo: '2 hours ago',
        impact: 'positive',
        relatedStocks: ['AAPL', 'GOOGL'],
        marketImpact: {
            description: 'Tech sector showing positive momentum',
            percentage: '+2.3%'
        }
    },
    // Add more mock news items...
] as const;