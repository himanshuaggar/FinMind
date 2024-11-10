import streamlit as st
import google.generativeai as genai
import pandas as pd
import plotly.graph_objects as go
import json
from datetime import datetime

# Configure Gemini API
genai.configure(api_key="AIzaSyDj_aU8gvsjWntoQp5gnC4DLhd9f4pjk7Q")

# Initialize the model
model = genai.GenerativeModel(model_name='gemini-pro',
                            generation_config={
                                'temperature': 0.7,
                                'top_p': 0.8,
                                'max_output_tokens': 2048,
                            })

# Initialize session state variables
if 'financial_data' not in st.session_state:
    st.session_state.financial_data = {
        'income': 0,
        'expenses': {},
        'savings': 0,
        'investments': {},
        'debts': {},
        'goals': []
    }

if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Function to calculate financial metrics
def calculate_financial_metrics(data):
    total_expenses = sum(data['expenses'].values())
    total_investments = sum(data['investments'].values())
    total_debts = sum(data['debts'].values())
    monthly_savings = data['income'] - total_expenses
    debt_to_income = (total_debts / data['income'] * 100) if data['income'] > 0 else 0
    savings_rate = (monthly_savings / data['income'] * 100) if data['income'] > 0 else 0
    
    return {
        'total_expenses': total_expenses,
        'total_investments': total_investments,
        'total_debts': total_debts,
        'monthly_savings': monthly_savings,
        'debt_to_income': debt_to_income,
        'savings_rate': savings_rate
    }

# Function to generate financial advice
def generate_financial_advice(metrics, data, query):
    prompt = f"""
    As a personal financial advisor, provide brief, goal-oriented advice for this query:

    User's Financial Goals:
    {json.dumps(data['goals'], indent=2)}

    Current Financial Snapshot:
    - Monthly Income: ₹{data['income']:,}
    - Monthly Expenses: ₹{metrics['total_expenses']:,}
    - Monthly Savings: ₹{metrics['monthly_savings']:,}
    - Total Investments: ₹{metrics['total_investments']:,}
    - Total Debts: ₹{metrics['total_debts']:,}

    User Query: {query}

    Provide a response that:
    1. Directly answers the specific question
    2. Links advice to their stated financial goals if it related to them
    3. Gives actionable steps with specific numbers with maximum 5 actionable steps if required
    4. Uses simple language and bullet points
    5. Keeps total response under 300 to 400 words

    Format the response as:
    • Direct answer to query
    • if required , give 2-3 specific action items with numbers
    • Connection to relevant financial goal(s)
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating advice: {str(e)}"

# Function to create visualization
def create_financial_overview_chart(metrics):
    labels = ['Income', 'Expenses', 'Savings', 'Investments', 'Debts']
    values = [
        st.session_state.financial_data['income'],
        metrics['total_expenses'],
        metrics['monthly_savings'],
        metrics['total_investments'],
        metrics['total_debts']
    ]
    
    fig = go.Figure(data=[go.Bar(
        x=labels,
        y=values,
        marker_color=['#2ecc71', '#e74c3c', '#3498db', '#f1c40f', '#e67e22']
    )])
    
    fig.update_layout(
        title='Financial Overview',
        xaxis_title='Category',
        yaxis_title='Amount (₹)',
        template='plotly_white'
    )
    
    return fig

# Streamlit UI
st.set_page_config(page_title="Financial Advisory Chatbot", layout="wide")
st.title("💰 Financial Advisory Chatbot")

# Sidebar for financial data input
with st.sidebar:
    st.header("📊 Your Financial Information")
    
    # Income input
    st.session_state.financial_data['income'] = st.number_input(
        "Monthly Income (₹)", 
        min_value=0, 
        value=st.session_state.financial_data['income']
    )
    
    # Expenses input
    st.subheader("Monthly Expenses")
    expense_categories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Other']
    for category in expense_categories:
        st.session_state.financial_data['expenses'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['expenses'].get(category, 0)
        )
    
    # Investments input
    st.subheader("Investments")
    investment_categories = ['Stocks', 'Mutual Funds', 'Fixed Deposits', 'Real Estate', 'Others']
    for category in investment_categories:
        st.session_state.financial_data['investments'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['investments'].get(category, 0)
        )
    
    # Debts input
    st.subheader("Debts")
    debt_categories = ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card', 'Other Debts']
    for category in debt_categories:
        st.session_state.financial_data['debts'][category] = st.number_input(
            f"{category} (₹)",
            min_value=0,
            value=st.session_state.financial_data['debts'].get(category, 0)
        )
    
    # Financial goals
    st.subheader("Financial Goals")
    new_goal = st.text_input("Add a financial goal")
    if new_goal and st.button("Add Goal"):
        st.session_state.financial_data['goals'].append(new_goal)
    
    # Display current goals
    if st.session_state.financial_data['goals']:
        st.write("Current Goals:")
        for i, goal in enumerate(st.session_state.financial_data['goals']):
            st.write(f"{i+1}. {goal}")

# Main chat interface
st.header("💬 Financial Advisor Chat")

# Calculate metrics
metrics = calculate_financial_metrics(st.session_state.financial_data)

# Display financial overview chart
st.plotly_chart(create_financial_overview_chart(metrics))

# Display key metrics
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Monthly Savings", f"₹{metrics['monthly_savings']:,.2f}")
with col2:
    st.metric("Debt-to-Income Ratio", f"{metrics['debt_to_income']:.1f}%")
with col3:
    st.metric("Savings Rate", f"{metrics['savings_rate']:.1f}%")

# Chat interface
for message in st.session_state.chat_history:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input
if prompt := st.chat_input("Ask for financial advice (e.g., 'How can I improve my savings?' or 'Should I invest in stocks?')"):
    # Display user message
    st.chat_message("user").markdown(prompt)
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    
    # Generate and display response
    with st.chat_message("assistant"):
        response = generate_financial_advice(metrics, st.session_state.financial_data, prompt)
        st.markdown(response)
        st.session_state.chat_history.append({"role": "assistant", "content": response})

# Additional information in sidebar
with st.sidebar:
    st.markdown("""
    ### 📝 How to Use
    1. Enter your financial information in the sidebar
    2. Add your financial goals
    3. Ask questions about your financial situation
    4. Get personalized recommendations
    
    ### 🎯 Example Questions
    - How can I improve my savings?
    - What's the best way to pay off my debts?
    - Should I invest more in mutual funds?
    - How can I achieve my financial goals faster?
    - Is my current investment portfolio balanced?
    """)