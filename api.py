from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
import logging
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import UnstructuredURLLoader, PyPDFLoader
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Verify API key
if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

app = FastAPI(title="FinanceGPT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class AnalysisRequest(BaseModel):
    urls: Optional[List[str]] = []
    analysis_type: str
    query: str

class AnalysisResponse(BaseModel):
    result: str
    sources: List[str]

# Initialize LLM
try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
except Exception as e:
    logger.error(f"Error initializing LLM: {str(e)}")
    raise

# Add this variable at the top with other globals
file_path = "faiss_store_finance"

# Create template
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

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_documents(request: AnalysisRequest):
    try:
        logger.info(f"Starting analysis request: {request}")
        
        # Validate input
        if not request.query:
            logger.warning("Empty query received")
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Check if vector store exists
        if not os.path.exists(file_path):
            logger.warning("No processed documents found")
            return AnalysisResponse(
                result="Please upload and process documents first.",
                sources=[]
            )
        
        try:
            # Load the existing vector store
            logger.info("Loading vector store")
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
            vectorstore = FAISS.load_local(
                file_path, 
                embeddings,
                allow_dangerous_deserialization=True
            )
            
            # Get the appropriate analysis prompt
            analysis_prompt = get_analysis_prompt(request.analysis_type)
            
            # Create retrieval chain
            logger.info("Creating retrieval chain")
            chain = RetrievalQA.from_chain_type(
                llm=llm,
                chain_type="stuff",
                retriever=vectorstore.as_retriever(
                    search_kwargs={"k": 3}
                ),
                return_source_documents=True,
                chain_type_kwargs={"prompt": analysis_prompt}
            )
            
            # Run the analysis
            logger.info(f"Running analysis with query: {request.query}")
            result = chain({"query": request.query})
            logger.info("Analysis completed successfully")

            # Extract sources
            sources = []
            if "source_documents" in result:
                sources = list(set(
                    doc.metadata.get("source", "") 
                    for doc in result["source_documents"]
                    if doc.metadata.get("source")
                ))
                logger.info(f"Found {len(sources)} unique sources")

            return AnalysisResponse(
                result=result.get("result", "No results found"),
                sources=sources
            )

        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail={"error": str(e), "step": "analysis"}
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"error": str(e), "step": "unexpected"}
        )

# Add a simple test endpoint
@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "API is working"}

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        logger.info(f"Receiving PDF upload: {file.filename}")
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        documents = []
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            # Process PDF
            logger.info("Processing PDF file")
            loader = PyPDFLoader(tmp_path)
            documents.extend(loader.load())
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                separators=['\n\n', '\n', '.', ','],
                chunk_size=1000
            )
            docs = text_splitter.split_documents(documents)
            
            # Create embeddings
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
            
            # Create or update vector store
            if os.path.exists(file_path):
                # Load existing store and add new documents
                existing_store = FAISS.load_local(
                    file_path, 
                    embeddings,
                    allow_dangerous_deserialization=True
                )
                existing_store.add_documents(docs)
                vectorstore = existing_store
            else:
                # Create new store
                vectorstore = FAISS.from_documents(docs, embeddings)
            
            # Save the updated store
            vectorstore.save_local(file_path)
            
            # Clean up
            os.unlink(tmp_path)
            
            return {
                "message": "PDF processed successfully",
                "pages": len(documents)
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in PDF upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Add the analysis prompt function from main.py
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
        - Profitability metrics
        - Return metrics (ROE, ROA)
        - Liquidity ratios
        - Cash flow analysis""",
        # ... (add other considerations as in main.py)
    }
    
    return PromptTemplate(
        template=base_template,
        input_variables=["context", "question"],
        partial_variables={
            "analysis_type": analysis_type,
            "specific_considerations": specific_considerations.get(analysis_type, "")
        }
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)