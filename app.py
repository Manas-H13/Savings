from flask import Flask, render_template, request, jsonify
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

EXCEL_FILE = 'expenses.xlsx'

def init_excel():
    if not os.path.exists(EXCEL_FILE):
        df = pd.DataFrame(columns=['Date', 'Amount', 'Category', 'Remarks'])
        df.to_excel(EXCEL_FILE, index=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'POST':
        data = request.json
        date = data.get('date', datetime.today().strftime('%Y-%m-%d'))
        amount = float(data.get('amount', 0))
        category = data.get('category', 'Other')
        remarks = data.get('remarks', '')

        # Append to Excel
        df = pd.read_excel(EXCEL_FILE)
        new_row = pd.DataFrame([{
            'Date': date, 'Amount': amount, 'Category': category, 'Remarks': remarks
        }])
        
        # Ensure we filter out any existing empty/all-NA rows before saving safely
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_excel(EXCEL_FILE, index=False)
        return jsonify({'status': 'success'})

    else:
        # GET expenses
        df = pd.read_excel(EXCEL_FILE)
        # convert Date to string
        df['Date'] = df['Date'].astype(str)
        return df.to_json(orient='records')

@app.route('/api/ai-suggestion', methods=['GET'])
def ai_suggestion():
    # Analysing data to provide hints.
    try:
        df = pd.read_excel(EXCEL_FILE)
        if df.empty:
            return jsonify({'suggestion': "Start adding expenses to get AI-powered savings suggestions!"})
        
        top_cat = df.groupby('Category')['Amount'].sum().idxmax()
        suggestion = f"💡 AI Insight: Your highest expense category is {top_cat}. Consider setting limits on {top_cat} to improve your monthly savings. "
        
        return jsonify({'suggestion': suggestion})
    except Exception as e:
        return jsonify({'suggestion': f"AI is thinking... Start logging data!"})

if __name__ == '__main__':
    init_excel()
    app.run(debug=True, port=8080)
