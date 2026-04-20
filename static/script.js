let expenseChartInstance = null;
let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    fetchData();

    // Form Submits
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, amount, category })
        });

        if (res.ok) {
            // Reset fields
            document.getElementById('amount').value = '';
            
            // Refresh
            fetchData();
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

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    const messages = document.getElementById('chat-messages');
    messages.innerHTML += `<div class="message user-msg">${msg}</div>`;
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: msg})
    });
    
    if(res.ok) {
        const data = await res.json();
        messages.innerHTML += `<div class="message hai-msg">${data.reply}</div>`;
        messages.scrollTop = messages.scrollHeight;
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
            <td>$${(row.Travel || 0).toFixed(2)}</td>
            <td>$${(row.Petrol || 0).toFixed(2)}</td>
            <td>$${(row.Food || 0).toFixed(2)}</td>
            <td>$${(row.Groceries || 0).toFixed(2)}</td>
            <td>$${(row.Utilities || 0).toFixed(2)}</td>
            <td>$${(row.Shopping || 0).toFixed(2)}</td>
            <td>$${(row.Other || 0).toFixed(2)}</td>
            <td><strong>$${(row.Total || 0).toFixed(2)}</strong></td>
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
            groupedObj[key] += parseFloat(item.Total || 0);
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
                label: 'Total Expenses',
                data: dataValues,
                backgroundColor: 'rgba(173, 216, 230, 0.8)',
                borderColor: '#87CEEB',
                borderWidth: 1,
                borderRadius: 0,
                barPercentage: 1.0,
                categoryPercentage: 1.0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#111' } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` Total for this ${viewMode}: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#111' },
                    grid: { color: 'rgba(0,0,0,0.1)' }
                },
                x: {
                    ticks: { color: '#111' },
                    grid: { display: false }
                }
            }
        }
    });
}
