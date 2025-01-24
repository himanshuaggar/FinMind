export const NEWS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
export const NEWS_CACHE_STALE_TIME = 30 * 60 * 1000; // 30 minutes
export const NEWS_CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export const NEWS_API_RATE_LIMIT = {
    DAILY_LIMIT: 100,
    WARNING_THRESHOLD: 80,
};

export const NEWS_PAGE_SIZE = 20;

export const SENTIMENT_THRESHOLDS = {
    POSITIVE: 0.3,
    NEGATIVE: -0.3,
    MIN_CONFIDENCE: 0.4,
};

export const CACHE_KEYS = {
    NEWS: 'news_cache_',
    NEWS_TIMESTAMP: 'news_last_fetch_',
    API_CALLS: 'news_api_calls_',
};

// News categories configuration
export const NEWS_CATEGORIES = [
    { id: 'all', label: 'All News', icon: 'rss-feed' },
    { id: 'business', label: 'Business', icon: 'business' },
    { id: 'technology', label: 'Technology', icon: 'computer' },
    { id: 'health', label: 'Health', icon: 'local-hospital' },
    { id: 'science', label: 'Science', icon: 'science' },
    { id: 'sports', label: 'Sports', icon: 'sports' },
    { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
];

// Sentiment analysis configuration
export const SENTIMENT_CONFIG = {
    positiveWords: [
        'surge', 'gain', 'rise', 'growth', 'positive', 'boost', 'rally',
        'breakthrough', 'success', 'improve', 'profit', 'advantage',
        'opportunity', 'innovation', 'progress'
    ],
    negativeWords: [
        'fall', 'drop', 'decline', 'negative', 'loss', 'risk', 'crash',
        'crisis', 'concern', 'warning', 'threat', 'problem', 'challenge',
        'difficulty', 'danger'
    ],
    marketTerms: [
        'market', 'stock', 'trade', 'investor', 'economy', 'sector',
        'index', 'shares', 'portfolio', 'investment', 'assets',
        'securities', 'dividend', 'yield'
    ],
    technicalTerms: [
        'resistance', 'support', 'volume', 'volatility', 'momentum',
        'trend', 'indicator', 'average', 'analysis', 'pattern',
        'breakout', 'consolidation'
    ]
};

// Error messages
export const ERROR_MESSAGES = {
    FETCH_FAILED: 'Failed to load news. Please try again later.',
    RATE_LIMIT: 'API rate limit exceeded. Using cached data.',
    INVALID_FORMAT: 'Invalid news data format received.',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    CACHE_ERROR: 'Error accessing cached data.',
};

// Default values
export const DEFAULTS = {
    IMAGE_URL: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000',
    SOURCE_ICON: 'https://www.google.com/s2/favicons?domain=news.com&sz=64',
    CATEGORY: 'all',
    PAGE_SIZE: 20,
    CACHE_VERSION: '1',
};