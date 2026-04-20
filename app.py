from flask import Flask, render_template, request, jsonify, send_file
import os
import random
from datetime import datetime
import openpyxl
from openpyxl.styles import Font

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

EXCEL_FILE = 'expenses.xlsx'
CATEGORIES = ['Travel', 'Petrol', 'Food', 'Groceries', 'Utilities', 'Shopping', 'Other']
COLUMNS = ['Date'] + CATEGORIES + ['Total']

def read_from_excel():
    if not os.path.exists(EXCEL_FILE): return {}
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    ws = wb.active
    
    data = {}
    header_found = False
    col_map = {}
    
    for row_cells in ws.iter_rows(values_only=True):
        if not header_found:
            if row_cells and row_cells[0] == 'Date':
                header_found = True
                col_map = {col: i for i, col in enumerate(row_cells) if col}
            continue
            
        if not row_cells or not row_cells[0]: continue
        date_val = str(row_cells[0]).strip()
        
        try:
            d = datetime.strptime(date_val, "%Y-%m-%d")
        except ValueError:
            continue
            
        if date_val not in data:
            data[date_val] = {cat: 0.0 for cat in CATEGORIES}
            
        for cat in CATEGORIES:
            idx = col_map.get(cat)
            if idx is not None and idx < len(row_cells):
                val = row_cells[idx]
                if val:
                    try: 
                        data[date_val][cat] += float(val)
                    except: pass
                    
    return data

def write_to_excel(data):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Expenses"
    
    sorted_dates = sorted(data.keys())
    current_month = None
    
    ws.append(COLUMNS)
    for cell in ws[1]:
        cell.font = Font(bold=True)
    
    for date_val in sorted_dates:
        d = datetime.strptime(date_val, "%Y-%m-%d")
        month_label = d.strftime("%B %Y")
        
        if month_label != current_month:
            if current_month is not None:
                ws.append([]) # space
            ws.append([month_label])
            ws.cell(row=ws.max_row, column=1).font = Font(bold=True, size=14, color="0000FF")
            current_month = month_label
            
        row = [date_val]
        total = 0.0
        for cat in CATEGORIES:
            amt = data[date_val].get(cat, 0.0)
            row.append(amt if amt > 0 else "")
            total += amt
        row.append(total)
        ws.append(row)
        
    wb.save(EXCEL_FILE)

if not os.path.exists(EXCEL_FILE):
    write_to_excel({})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download-excel')
def download_excel():
    return send_file(EXCEL_FILE, as_attachment=True)

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'POST':
        req_data = request.json
        date = req_data.get('date', datetime.today().strftime('%Y-%m-%d'))
        amount = float(req_data.get('amount', 0))
        category = req_data.get('category', 'Other')

        data = read_from_excel()
        if date not in data:
            data[date] = {cat: 0.0 for cat in CATEGORIES}
        
        if category in data[date]:
            data[date][category] += amount
            
        write_to_excel(data)
        return jsonify({'status': 'success'})

    else:
        # GET expenses
        data = read_from_excel()
        # format list
        results = []
        for d_key, cats in data.items():
            entry = {'Date': d_key}
            total = 0
            for c, a in cats.items():
                entry[c] = a
                total += a
            entry['Total'] = total
            results.append(entry)
            
        return jsonify(results)

@app.route('/api/ai-suggestion', methods=['GET'])
def ai_suggestion():
    try:
        data = read_from_excel()
        if not data:
            return jsonify({'suggestion': "Start adding expenses to get AI-powered savings suggestions!"})
        
        # Calculate totals
        cat_totals = {cat: 0.0 for cat in CATEGORIES}
        total_spent = 0.0
        
        for cats in data.values():
            for c, a in cats.items():
                cat_totals[c] += a
                total_spent += a
                
        top_cat = max(cat_totals, key=cat_totals.get)
        if total_spent == 0:
            return jsonify({'suggestion': "Add an amount greater than 0 to get tips!"})
            
        tips = [
            f"💡 Your highest expense is {top_cat}. Consider setting limits to improve savings.",
            f"💡 You have logged a total of ${total_spent:.2f}. Keep tracking!",
            f"💡 A simple rule: try to save 20% of your total income. Cutting {top_cat} helps.",
            f"💡 Have you considered a 'no-spend' day this week? It builds great habits."
        ]
        
        suggestion = " ".join(random.sample(tips, 2))
        return jsonify({'suggestion': suggestion})
    except Exception as e:
        return jsonify({'suggestion': f"AI is thinking... Start logging data!"})

if __name__ == '__main__':
    app.run(debug=True, port=8080)
