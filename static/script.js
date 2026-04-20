let expenseChartInstance = null;
let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    fetchData();
    fetchAI();

    // Form Submits
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;
        const remarks = document.getElementById('remarks').value;

        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, amount, category, remarks })
        });

        if (res.ok) {
            // Reset fields
            document.getElementById('amount').value = '';
            document.getElementById('remarks').value = '';
            
            // Refresh
            fetchData();
            fetchAI();
        }
    });
});

async function fetchData() {
    const res = await fetch('/api/expenses');
    if (res.ok) {
        allData = await res.json();
        updateTable();
        updateChart('daily');
    }
}

async function fetchAI() {
    const res = await fetch('/api/ai-suggestion');
    if (res.ok) {
        const data = await res.json();
        document.getElementById('ai-text').innerText = data.suggestion;
    }
}

function updateTable() {
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '';
    
    // Reverse to show newest first!
    const sortedData = [...allData].reverse();
    
    sortedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.Date}</td>
            <td>${row.Category}</td>
            <td>${row.Remarks || '-'}</td>
            <td><strong>$${parseFloat(row.Amount).toFixed(2)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateChart(viewMode) {
    // viewMode: 'daily', 'monthly', 'yearly'
    
    // Update tab active state
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.toLowerCase() === viewMode) {
            btn.classList.add('active');
        }
    });

    const groupedObj = {};
    
    allData.forEach(item => {
        let key = '';
        if (item.Date && item.Date !== "None") {
            const d = new Date(item.Date);
            if(isNaN(d)) return;
            
            if (viewMode === 'daily') {
                key = item.Date; // YYYY-MM-DD
            } else if (viewMode === 'monthly') {
                key = d.toISOString().substring(0, 7); // YYYY-MM
            } else if (viewMode === 'yearly') {
                key = d.toISOString().substring(0, 4); // YYYY
            }
        }
        
        if (key) {
            if (!groupedObj[key]) groupedObj[key] = 0;
            groupedObj[key] += parseFloat(item.Amount || 0);
        }
    });

    // Sort Keys
    const labels = Object.keys(groupedObj).sort();
    const dataValues = labels.map(l => groupedObj[l]);

    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }
    
    // ChartJS Config with nice theme
    expenseChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: dataValues,
                backgroundColor: 'rgba(102, 252, 241, 0.7)',
                borderColor: '#66fcf1',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#c5c6c7' } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#c5c6c7' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: '#c5c6c7' },
                    grid: { display: false }
                }
            }
        }
    });
}
