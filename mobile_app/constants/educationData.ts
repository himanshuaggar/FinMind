import { MaterialIcons } from "@expo/vector-icons";

export const DAILY_FINANCIAL_TIP = {
    category: 'Daily Tip',
    title: 'Understanding Compound Interest',
    description: 'Compound interest is when you earn interest on both your initial investment and previously earned interest. This can significantly boost your long-term savings.',
    icon: 'trending-up'
};

export const FINANCIAL_TERMS = [
    {
        term: 'Bull Market',
        definition: 'A market condition where prices are rising or expected to rise.',
        contentUrl: 'https://www.investopedia.com/terms/b/bullmarket.asp'
    },
    {
        term: 'Bear Market',
        definition: 'A market condition where prices are falling or expected to fall.',
        contentUrl: 'https://www.investopedia.com/terms/b/bearmarket.asp'
    },
    {
        term: 'Dividend',
        definition: 'A portion of company profits distributed to shareholders.',
        contentUrl: 'https://www.investopedia.com/terms/d/dividend.asp'
    },
    {
        term: 'P/E Ratio',
        definition: 'Price-to-Earnings ratio, used to value a company\'s stock.',
        contentUrl: 'https://www.investopedia.com/terms/p/price-earningsratio.asp'
    },
    {
        term: 'Market Capitalization',
        definition: 'Total value of a company\'s shares in the market.',
        contentUrl: 'https://www.investopedia.com/terms/m/marketcapitalization.asp'
    },
    {
        term: 'Volatility',
        definition: 'Measure of price fluctuations and market uncertainty.',
        contentUrl: 'https://www.investopedia.com/terms/v/volatility.asp'
    },
    {
        term: 'Liquidity',
        definition: 'How easily an asset can be converted to cash.',
        contentUrl: 'https://www.investopedia.com/terms/l/liquidity.asp'
    },
    {
        term: 'Diversification',
        definition: 'Spreading investments across different assets to reduce risk.',
        contentUrl: 'https://www.investopedia.com/terms/d/diversification.asp'
    },
    {
        term: 'Blue Chip Stocks',
        definition: 'Shares of large, well-established companies.',
        contentUrl: 'https://www.investopedia.com/terms/b/bluechip.asp'
    },
    {
        term: 'Yield',
        definition: 'Return on investment expressed as a percentage.',
        contentUrl: 'https://www.investopedia.com/terms/y/yield.asp'
    },
    {
        term: 'ETF',
        definition: 'Exchange-Traded Fund, a basket of securities that trades like a stock.',
        contentUrl: 'https://www.investopedia.com/terms/e/etf.asp'
    },
    {
        term: 'Short Selling',
        definition: 'Betting against a stock by selling borrowed shares.',
        contentUrl: 'https://www.investopedia.com/terms/s/shortselling.asp'
    }
] as const;

export const MARKET_LESSONS = [
    {
        title: 'Understanding Market Cycles',
        category: 'Market Analysis',
        duration: 5,
        progress: 60,
        description: 'Learn about different market cycles and how they affect investment decisions.',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/financial-theory/11/understanding-market-cycles.asp'
    },
    {
        title: 'Technical Analysis Basics',
        category: 'Trading',
        duration: 8,
        progress: 30,
        description: 'Introduction to chart patterns and technical indicators.',
        imageUrl: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/technical/02/121702.asp'
    },
    {
        title: 'Fundamental Analysis',
        category: 'Investment',
        duration: 10,
        progress: 0,
        description: 'Learn how to analyze company financials and valuations.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/stocks/06/fundamentalanalysis.asp'
    },
    {
        title: 'Risk Management',
        category: 'Strategy',
        duration: 6,
        progress: 45,
        description: 'Essential principles of managing investment risks.',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/investing/052913/risk-management-techniques-investors.asp'
    },
    {
        title: 'Global Markets',
        category: 'International',
        duration: 7,
        progress: 20,
        description: 'Understanding international markets and trading.',
        imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/investing/102914/understanding-global-markets.asp'
    },
    {
        title: 'Portfolio Management',
        category: 'Investment',
        duration: 12,
        progress: 15,
        description: 'Learn to build and manage investment portfolios.',
        imageUrl: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/investing/102914/portfolio-management.asp'
    },
    {
        title: 'Options Trading',
        category: 'Advanced',
        duration: 15,
        progress: 0,
        description: 'Understanding options and derivatives trading.',
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/optioninvestor/08/options-trading.asp'
    },
    {
        title: 'Market Psychology',
        category: 'Behavior',
        duration: 4,
        progress: 75,
        description: 'Understanding investor behavior and market sentiment.',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop',
        contentUrl: 'https://www.investopedia.com/articles/investing/051216/understanding-market-psychology.asp'
    }
] as const;

export const ECONOMIC_INDICATORS = [
    {
        name: 'GDP Growth',
        value: '3.2%',
        change: '+0.4%',
        trend: 'up',
        icon: 'trending-up'
    },
    {
        name: 'Inflation Rate',
        value: '2.1%',
        change: '-0.2%',
        trend: 'down',
        icon: 'attach-money'
    },
    {
        name: 'Interest Rate',
        value: '5.5%',
        change: '0%',
        trend: 'neutral',
        icon: 'account-balance'
    },
    {
        name: 'Unemployment',
        value: '3.8%',
        change: '-0.1%',
        trend: 'down',
        icon: 'people'
    },
    {
        name: 'Consumer Confidence',
        value: '108.3',
        change: '+2.1',
        trend: 'up',
        icon: 'sentiment-satisfied'
    },
    {
        name: 'Manufacturing PMI',
        value: '52.8',
        change: '+1.2',
        trend: 'up',
        icon: 'factory'
    },
    {
        name: 'Retail Sales',
        value: '+0.7%',
        change: '+0.2%',
        trend: 'up',
        icon: 'shopping-cart'
    },
    {
        name: 'Housing Starts',
        value: '1.45M',
        change: '-2.1%',
        trend: 'down',
        icon: 'home'
    }
] as const;

export const INVESTMENT_IDEAS = [
    {
        category: 'Sector Focus',
        title: 'Clean Energy Transition',
        description: 'Opportunities in renewable energy and sustainable technologies.',
        riskLevel: 'Moderate',
        timeHorizon: 'Long Term',
        contentUrl: 'https://www.investopedia.com/clean-energy-transition-5189803'
    },
    {
        category: 'Global Trends',
        title: 'AI & Automation',
        description: 'Companies leading in artificial intelligence and automation.',
        riskLevel: 'High',
        timeHorizon: 'Medium Term',
        contentUrl: 'https://www.investopedia.com/ai-and-automation-5189804'
    },
    {
        category: 'Emerging Markets',
        title: 'India Tech Sector',
        description: 'Growth opportunities in India\'s expanding technology sector.',
        riskLevel: 'High',
        timeHorizon: 'Long Term',
        contentUrl: 'https://www.investopedia.com/india-tech-sector-5189805'
    },
    {
        category: 'Defensive',
        title: 'Consumer Staples',
        description: 'Stable companies providing essential consumer goods.',
        riskLevel: 'Low',
        timeHorizon: 'Short Term',
        contentUrl: 'https://www.investopedia.com/consumer-staples-5189806'
    },
    {
        category: 'Healthcare',
        title: 'Biotech Innovation',
        description: 'Companies developing breakthrough medical technologies.',
        riskLevel: 'High',
        timeHorizon: 'Long Term',
        contentUrl: 'https://www.investopedia.com/biotech-innovation-5189807'
    },
    {
        category: 'Infrastructure',
        title: 'Digital Infrastructure',
        description: 'Companies building the future of digital connectivity.',
        riskLevel: 'Moderate',
        timeHorizon: 'Medium Term',
        contentUrl: 'https://www.investopedia.com/digital-infrastructure-5189808'
    },
    {
        category: 'Commodities',
        title: 'Precious Metals',
        description: 'Gold and silver as inflation hedges.',
        riskLevel: 'Moderate',
        timeHorizon: 'Medium Term',
        contentUrl: 'https://www.investopedia.com/precious-metals-5189809'
    },
    {
        category: 'Real Estate',
        title: 'Data Centers',
        description: 'REITs focused on digital infrastructure.',
        riskLevel: 'Moderate',
        timeHorizon: 'Long Term',
        contentUrl: 'https://www.investopedia.com/data-centers-5189810'
    },
    {
        category: 'Financial',
        title: 'Fintech Revolution',
        description: 'Digital payment and banking innovation leaders.',
        riskLevel: 'High',
        timeHorizon: 'Medium Term',
        contentUrl: 'https://www.investopedia.com/fintech-revolution-5189811'
    },
    {
        category: 'ESG',
        title: 'Sustainable Investing',
        description: 'Companies with strong environmental and social practices.',
        riskLevel: 'Moderate',
        timeHorizon: 'Long Term',
        contentUrl: 'https://www.investopedia.com/sustainable-investing-5189812'
    }
] as const;

export interface FinancialTip {
    category: string;
    title: string;
    description: string;
    icon: keyof typeof MaterialIcons.glyphMap;
}

export interface FinancialTerm {
    term: string;
    definition: string;
    contentUrl: string;
}

export interface MarketLesson {
    title: string;
    category: string;
    duration: number;
    progress: number;
    description: string;
    imageUrl: string;
    contentUrl: string;
}

export interface EconomicIndicator {
    name: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: keyof typeof MaterialIcons.glyphMap;
}

export interface InvestmentIdea {
    category: string;
    title: string;
    description: string;
    riskLevel: 'Low' | 'Moderate' | 'High';
    timeHorizon: 'Short Term' | 'Medium Term' | 'Long Term';
    contentUrl: string;
}