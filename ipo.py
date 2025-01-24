import os
import tempfile
import streamlit as st
from langchain.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain

# Define the functions for the IPO Analyzer
def load_and_split_documents(uploaded_file):
    """Load and split uploaded documents into smaller chunks."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.read())
        tmp_file_path = tmp_file.name

    loader = PyPDFLoader(tmp_file_path)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    texts = text_splitter.split_documents(documents)
    return texts

def build_faiss_index(texts):
    """Build FAISS index for efficient retrieval."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key='AIzaSyCqH_SI3gdZCbEt5Affl1dJxbCRSzPlUQ8')
    vectorstore = FAISS.from_documents(texts, embeddings)
    return vectorstore

def analyze_ipo_document(vectorstore):
    """Create a detailed analysis based on the document."""
    llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7, google_api_key='AIzaSyCqH_SI3gdZCbEt5Affl1dJxbCRSzPlUQ8', convert_system_message_to_human=True)
    prompt = PromptTemplate(
        template="""
        You are an AI specialized in financial analysis of IPO documents. Given the content of the document, provide a basic overview covering the following aspects:

        1. Company Overview:
            - Business Description: The company's history, operations, and products/services.
        2. Financial Performance:
            - Historical Financials: Revenue and profit/loss.
        3. Use of Proceeds:
            - Allocation of Funds: How the company plans to use the IPO proceeds.
        4. Risk Factors:
            - Business Risks: Competition and market fluctuations.
        5. Offer Details:
            - Offer Size and Price: Number of shares offered and the price range.

        Provide a concise summary with key points.
        """
    )

    chain = ConversationalRetrievalChain.from_llm(llm, retriever=vectorstore.as_retriever())

    context = "Provide a detailed analysis of the IPO document."
    question = "What are the key aspects of the IPO document?"

    response = chain.run({"context": context, "question": question, "prompt": prompt, "chat_history": []})
    return response

def upload_and_process_file():
    """Handle file upload and document processing."""
    uploaded_file = st.file_uploader("Upload DRHP or RHP Document (PDF or TXT)", type=["pdf", "txt"])

    if uploaded_file is not None:
        texts = load_and_split_documents(uploaded_file)
        vectorstore = build_faiss_index(texts)
        st.success("Document processed and indexed successfully!")

        analysis = analyze_ipo_document(vectorstore)
        st.markdown("### Detailed IPO Analysis")
        st.write(analysis)

# Streamlit Frontend
st.title("AI IPO Analyzer")
st.markdown("""
### Analyze IPO Documents
Upload Draft Red Herring Prospectus (DRHP) or Red Herring Prospectus (RHP) files to receive deep insights, financial analysis, and investment recommendations.
""")

upload_and_process_file()