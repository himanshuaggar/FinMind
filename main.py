import os
import streamlit as st
import time
import PyPDF2
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate

from dotenv import load_dotenv
load_dotenv()

# Verify API key is loaded
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

st.title("FinanceGPT: Financial Research Assistant 📈")
st.sidebar.title("Document Sources")

# Add tabs for different input types
tab1, tab2 = st.tabs(["News Articles", "Financial Reports"])

with tab1:
    st.subheader("Add Financial News URLs")
    urls = []
    for i in range(3):
        url = st.text_input(f"Financial News URL {i+1}", 
                          help="Add URLs from financial news sources like Bloomberg, Reuters, etc.")
        urls.append(url)

with tab2:
    st.subheader("Upload Financial Documents")
    uploaded_files = st.file_uploader(
        "Upload company financial reports (PDF)", 
        accept_multiple_files=True,
        help="Upload annual reports, quarterly reports, or other financial documents"
    )

process_clicked = st.sidebar.button("Process Documents")
file_path = "faiss_store_finance"

main_placeholder = st.empty()

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.7,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# Create a finance-focused prompt template
template = """You are a financial analyst expert. Use the following information to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

When analyzing financial data:
- Provide specific numbers and metrics when available
- Compare with industry standards if relevant
- Highlight key risks and opportunities
- Consider both quantitative and qualitative factors

Context: {context}

Question: {question}

Detailed Analysis:"""

PROMPT = PromptTemplate(
    template=template,
    input_variables=["context", "question"]
)

if process_clicked:
    documents = []
    
    # Process URLs if provided
    if any(urls):
        loader = UnstructuredURLLoader(urls=[url for url in urls if url])
        main_placeholder.text("Loading news articles...✅")
        documents.extend(loader.load())

    # Process PDFs if uploaded
    if uploaded_files:
        for file in uploaded_files:
            temp_path = f"temp_{file.name}"
            with open(temp_path, "wb") as f:
                f.write(file.getvalue())
            loader = PyPDFLoader(temp_path)
            main_placeholder.text(f"Processing {file.name}...✅")
            documents.extend(loader.load())
            os.remove(temp_path)

    # Split documents
    text_splitter = RecursiveCharacterTextSplitter(
        separators=['\n\n', '\n', '.', ','],
        chunk_size=1000
    )
    main_placeholder.text("Processing documents...✅")
    docs = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore_finance = FAISS.from_documents(docs, embeddings)
    main_placeholder.text("Creating knowledge base...✅")
    time.sleep(2)

    # Save the FAISS index
    vectorstore_finance.save_local(file_path)
    main_placeholder.text("Ready to answer questions about your documents! 🚀")

# Update the query types and templates section
st.sidebar.markdown("## Analysis Type")
analysis_type = st.sidebar.selectbox(
    "Select Analysis Type:",
    [
        "Financial Metrics Analysis",
        "Risk Assessment",
        "Market Trends",
        "Competitive Analysis",
        "Regulatory Compliance",
        "Investment Opportunities",
        "Custom Query"
    ]
)

# Enhanced query templates for each analysis type
query_templates = {
    "Financial Metrics Analysis": {
        "template": """Analyze the following financial metrics:
1. Revenue and Growth
2. Profit Margins
3. ROE and ROA
4. Debt-to-Equity Ratio
5. Working Capital
Please provide specific numbers and year-over-year comparisons."""
    },
    "Risk Assessment": {
        "template": """Identify and analyze:
1. Key Business Risks
2. Market Risks
3. Financial Risks
4. Operational Risks
5. Regulatory Risks
Provide specific examples and potential impact assessments."""
    },
    "Market Trends": {
        "template": """Analyze the following market aspects:
1. Industry Growth Trends
2. Market Share Analysis
3. Consumer Behavior Shifts
4. Technology Impact
5. Future Market Projections
Include specific data points and market statistics."""
    },
    "Competitive Analysis": {
        "template": """Provide analysis of:
1. Major Competitors
2. Market Position
3. Competitive Advantages
4. Market Share Comparison
5. Strategic Initiatives
Include specific competitor comparisons and market data."""
    },
    "Regulatory Compliance": {
        "template": """Evaluate:
1. Current Compliance Status
2. Regulatory Requirements
3. Recent/Upcoming Regulatory Changes
4. Compliance Costs
5. Potential Regulatory Risks
Highlight specific regulations and their impact."""
    },
    "Investment Opportunities": {
        "template": """Analyze:
1. Growth Potential
2. Investment Risks
3. Valuation Metrics
4. Market Opportunity
5. Strategic Advantages
Provide specific investment metrics and potential returns."""
    },
    "Custom Query": {
        "template": ""
    }
}

# Create a more detailed prompt template based on analysis type
def get_analysis_prompt(analysis_type):
    base_template = """You are a financial expert specialized in {analysis_type}. 
    Analyze the provided information and give a detailed response.
    
    When analyzing, consider:
    {specific_considerations}
    
    Context: {context}
    Question: {question}
    
    Provide a structured analysis with:
    1. Key Findings
    2. Detailed Analysis
    3. Supporting Data
    4. Recommendations
    """
    
    specific_considerations = {
        "Financial Metrics Analysis": """
        - Revenue trends and growth rates
        - Profitability metrics (Gross margin, Operating margin, Net margin)
        - Return metrics (ROE, ROA, ROIC)
        - Liquidity ratios
        - Cash flow analysis""",
        
        "Risk Assessment": """
        - Market risks and volatility
        - Operational risks
        - Financial risks
        - Strategic risks
        - External risk factors""",
        
        "Market Trends": """
        - Industry growth patterns
        - Market share dynamics
        - Consumer behavior shifts
        - Technological disruptions
        - Competitive landscape changes""",
        
        "Competitive Analysis": """
        - Market position
        - Competitive advantages
        - Peer comparison
        - Strategic initiatives
        - Market share analysis""",
        
        "Regulatory Compliance": """
        - Current regulatory status
        - Upcoming regulatory changes
        - Compliance costs
        - Industry standards
        - Risk mitigation measures""",
        
        "Investment Opportunities": """
        - Growth potential
        - Valuation metrics
        - Risk-return profile
        - Market opportunities
        - Investment timeline"""
    }
    
    return PromptTemplate(
        template=base_template,
        input_variables=["context", "question"],
        partial_variables={
            "analysis_type": analysis_type,
            "specific_considerations": specific_considerations.get(analysis_type, "")
        }
    )

# Update the query interface
if analysis_type == "Custom Query":
    query = st.text_input(
        "Your Question:",
        value="",
        help="Ask specific questions about the documents"
    )
else:
    query = st.text_area(
        "Your Question:",
        value=query_templates[analysis_type]["template"],
        height=150,
        help="Ask specific questions about the documents or use the template provided"
    )

if query:
    if os.path.exists(file_path):
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore = FAISS.load_local(
            file_path, 
            embeddings,
            allow_dangerous_deserialization=True
        )
        
        # Use the specific prompt for the selected analysis type
        analysis_prompt = get_analysis_prompt(analysis_type)
        
        chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(),
            return_source_documents=True,
            chain_type_kwargs={"prompt": analysis_prompt}
        )
        
        with st.spinner(f'Performing {analysis_type}...'):
            result = chain({"query": query})
        
        # Display the analysis with better formatting
        st.header(f"{analysis_type} Results")
        st.markdown(result["result"])
        
        # Add visualization section if applicable
        if analysis_type in ["Financial Metrics Analysis", "Market Trends"]:
            st.subheader("Key Metrics Visualization")
            st.info("Visualization features will be added based on the analysis results")
        
        # Display sources
        st.subheader("Sources:")
        sources = set()
        for doc in result["source_documents"]:
            source = doc.metadata.get("source", "")
            if source:
                sources.add(source)
        
        for source in sources:
            st.markdown(f"- {source}")

# Add additional UI elements for specific analysis types
if analysis_type == "Financial Metrics Analysis":
    st.sidebar.markdown("### Time Period")
    time_period = st.sidebar.selectbox(
        "Select Analysis Period:",
        ["Last Quarter", "Last Year", "Last 3 Years", "Last 5 Years", "Custom"]
    )

if analysis_type == "Competitive Analysis":
    st.sidebar.markdown("### Competitor Focus")
    competitors = st.sidebar.multiselect(
        "Select Competitors to Analyze:",
        ["Direct Competitors", "Indirect Competitors", "Market Leaders", "Emerging Players"]
    )
