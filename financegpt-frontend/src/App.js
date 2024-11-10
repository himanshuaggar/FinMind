import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State management
  const [urls, setUrls] = useState(['', '', '']);
  const [analysisType, setAnalysisType] = useState('Financial Metrics Analysis');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('Last Year');
  const [competitors, setCompetitors] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('');

  const analysisTypes = [
    'Financial Metrics Analysis',
    'Risk Assessment',
    'Market Trends',
    'Competitive Analysis',
    'Regulatory Compliance',
    'Investment Opportunities',
    'Custom Query'
  ];

  const timePeriods = [
    'Last Quarter',
    'Last Year',
    'Last 3 Years',
    'Last 5 Years',
    'Custom'
  ];

  const competitorTypes = [
    'Direct Competitors',
    'Indirect Competitors',
    'Market Leaders',
    'Emerging Players'
  ];

  // Query templates
  const queryTemplates = {
    "Financial Metrics Analysis": `Analyze the following financial metrics:
1. Revenue and Growth
2. Profit Margins
3. ROE and ROA
4. Debt-to-Equity Ratio
5. Working Capital
Please provide specific numbers and year-over-year comparisons.`,
    "Risk Assessment": `Identify and analyze:
1. Key Business Risks
2. Market Risks
3. Financial Risks
4. Operational Risks
5. Regulatory Risks
Provide specific examples and potential impact assessments.`,
    "Market Trends":
      `Analyze the following market aspects:
1. Industry Growth Trends
2. Market Share Analysis
3. Consumer Behavior Shifts
4. Technology Impact
5. Future Market Projections
Include specific data points and market statistics.`,
    "Competitive Analysis":
      `Provide analysis of:
1. Major Competitors
2. Market Position
3. Competitive Advantages
4. Market Share Comparison
5. Strategic Initiatives
Include specific competitor comparisons and market data.`,
    "Regulatory Compliance":
      `Evaluate:
1. Current Compliance Status
2. Regulatory Requirements
3. Recent/Upcoming Regulatory Changes
4. Compliance Costs
5. Potential Regulatory Risks
Highlight specific regulations and their impact.`,
    "Investment Opportunities":
      `Analyze:
1. Growth Potential
2. Investment Risks
3. Valuation Metrics
4. Market Opportunity
5. Strategic Advantages
Provide specific investment metrics and potential returns.`
    ,
  };

  useEffect(() => {
    if (analysisType !== 'Custom Query') {
      setQuery(queryTemplates[analysisType] || '');
    } else {
      setQuery('');
    }
  }, [analysisType]);

  // Handlers
  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        setProcessingStatus(`Processing ${file.name}...`);
        await axios.post('http://localhost:8000/api/upload-pdf', formData);
        setProcessingStatus(`${file.name} processed successfully ✅`);
      } catch (error) {
        setError(`Error processing ${file.name}: ${error.message}`);
      }
    }
  };

  const handleProcessDocuments = async () => {
    setProcessingStatus('Processing documents...');
    try {
      // Process URLs and files
      setProcessingStatus('Creating knowledge base...');
      // Additional processing logic here
      setProcessingStatus('Ready to answer questions! 🚀');
    } catch (error) {
      setError(`Error processing documents: ${error.message}`);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const validUrls = urls.filter(url => url.trim());

      if (!validUrls.length && !files.length) {
        throw new Error("Please provide at least one URL or upload a document");
      }

      if (!query.trim()) {
        throw new Error("Please enter a query");
      }

      const response = await axios.post('http://localhost:8000/api/analyze', {
        urls: validUrls,
        analysis_type: analysisType,
        query: query,
        time_period: timePeriod,
        competitors: competitors
      });

      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>FinanceGPT: Financial Research Assistant 📈</h1>

      <div className="main-container">
        <div className="sidebar">
          <h2>Document Sources</h2>
          <button
            className="process-button"
            onClick={handleProcessDocuments}
          >
            Process Documents
          </button>

          {analysisType === 'Financial Metrics Analysis' && (
            <div className="sidebar-section">
              <h3>Time Period</h3>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              >
                {timePeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          )}

          {analysisType === 'Competitive Analysis' && (
            <div className="sidebar-section">
              <h3>Competitor Focus</h3>
              <select
                multiple
                value={competitors}
                onChange={(e) => setCompetitors(Array.from(e.target.selectedOptions, option => option.value))}
              >
                {competitorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="content">
          <div className="tabs">
            <div className="tab-section">
              <h3>Financial News URLs</h3>
              {urls.map((url, index) => (
                <input
                  key={index}
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder={`Financial News URL ${index + 1}`}
                />
              ))}
            </div>

            <div className="tab-section">
              <h3>Upload Financial Documents</h3>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
              />
              {processingStatus && (
                <div className="processing-status">{processingStatus}</div>
              )}
            </div>
          </div>

          <div className="analysis-section">
            <h3>Analysis Type</h3>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              {analysisTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <h3>Your Question</h3>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question here..."
            />

            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading">
              Analyzing documents... Please wait...
            </div>
          )}

          {result && (
            <div className="results-section">
              <h2>Analysis Results</h2>
              <div className="analysis-result">
                {result.result}
              </div>

              {analysisType === 'Financial Metrics Analysis' && (
                <div className="visualization-section">
                  <h3>Key Metrics Visualization</h3>
                  {/* Visualization components will go here */}
                </div>
              )}

              <h3>Sources</h3>
              <ul className="sources-list">
                {result.sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;