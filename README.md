# ✦ Expense & Savings Tracker

A fully robust, modern web-based expense tracking application built using **Python (Flask)**, a purely dynamic **Excel (.xlsx)** database backend, and a vibrant **Glassmorphism UI** front-end. It features cross-platform local networking and an interactive AI data analyst.

## 🌟 Key Features

* **Intelligent Excel Data Architecture** 📁
  * Entirely autonomous database mapping. Bypasses standard SQL logic entirely by automatically formatting and securely tracking your spending natively in an Excel workbook (`ExpensesBack.xlsx`).
  * Organizes variables purely horizontally against exact Day numbers (`Date | Travel | Petrol | Food... | Total`) separated dynamically by rich Month/Year headers to provide flawless readability if you open the raw Excel sheet.
* **"Hai" - Your Personal AI Savings Chatbot** 🤖
  * Replaces stagnant advice with a fully functioning interactive web chatbot.
  * Hai natively parses and runs the math against all your logged transactions. It answers customized requests: breaking down exact category reports, targeting your heaviest single expenditure, calculating 20% future estimations against your global total, and deploying the 50/30/20 strategy.
* **Fluid Data Visualization & Charts** 📈
  * Custom Light-Blue histogram integrations utilizing `Chart.js`. Hover tooltips cleanly mapping all expenditures exclusively into the Indian Rupee (₹).
* **Cross-Device Mobile Accessibility** 📱
  * The Python application bridges locally with your IP Network adapter. Run it on your PC and access the entire UI securely connected via your mobile phone browser (e.g. `http://192.168.X.X:8080`).
* **Sleek Aesthetic Enhancements** ✨
  * High-contrast graphical layers deploying a Golden, Orange, and Blue gradient. 

## ⚙️ Installation & Usage

### 1. Clone the repository
```bash
git clone https://github.com/Manas-H13/Savings.git
cd Savings
```

### 2. Install dependencies
Ensure you have Python installed. Then, run:
```bash
pip install -r requirements.txt
```

### 3. Run the application
```bash
python app.py
```

### 4. Open in Browser
* **On your PC**: Go to `http://127.0.0.1:8080/`
* **On your Mobile**: Ensure you are connected to the exact same Wi-Fi. Find your PC's IP address (e.g., `192.168.31.212`) via terminal `ipconfig` and load exactly: `http://192.168.31.212:8080`

## 🛠️ Tech Stack
* **Backend**: Python, Flask, openpyxl 
* **Database**: Native XLSX dynamic injection
* **Frontend**: HTML5, Vanilla JavaScript (Chart.js), CSS (Glassmorphism)
