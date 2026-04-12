function initDashboard() {
  loadDashboard();
}

function getLoggedUser() {
  return (
    JSON.parse(localStorage.getItem("loggedUser")) ||
    JSON.parse(sessionStorage.getItem("loggedUser"))
  );
}

async function loadDashboard() {
  const loggedUser = getLoggedUser();
  const userData = await getData(`users/${loggedUser.id}`);

  const incomes = userData.transactions?.income || [];
  const expenses = userData.transactions?.expenses || [];

  updateDashboardCards(incomes, expenses);
  renderChart(incomes, expenses);
  renderIncomeDoughnutChart(incomes);
  renderExpenseDoughnutChart(expenses);
  renderRecentTransactions(incomes, expenses);
}

function updateDashboardCards(incomes, expenses) {
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpenseEl = document.getElementById("totalExpense");
  const totalBalanceEl = document.getElementById("totalBalance");
  const thisMonthEl = document.getElementById("thisMonth");

  let totalIncome = 0;
  let totalExpense = 0;
  let thisMonthBalance = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  //   Total Income
  incomes.forEach((i) => {
    totalIncome += Number(i.amount);

    const d = new Date(i.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      thisMonthBalance += Number(i.amount);
    }
  });

  expenses.forEach((i) => {
    totalExpense += Number(i.amount);

    const d = new Date(i.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      thisMonthBalance -= Number(i.amount);
    }
  });

  const balance = totalIncome - totalExpense;

  totalIncomeEl.innerText = totalIncome.toLocaleString();
  totalExpenseEl.innerText = totalExpense.toLocaleString();
  totalBalanceEl.innerText = balance.toLocaleString();
  thisMonthEl.innerText = thisMonthBalance.toLocaleString();

  totalBalanceEl.style.color = balance > 0 ? "lightgreen" : "red";
}

function renderChart(incomes, expenses) {
  const monthlyIncome = new Array(12).fill(0);
  const monthlyExpense = new Array(12).fill(0);

  incomes.forEach((inc) => {
    const d = new Date(inc.date);
    if (!isNaN(d)) {
      monthlyIncome[d.getMonth()] += Number(inc.amount);
    }
  });

  expenses.forEach((exp) => {
    const d = new Date(exp.date);
    if (!isNaN(d)) {
      monthlyExpense[d.getMonth()] += Number(exp.amount);
    }
  });

  const ctx = document.getElementById("myChart");

  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  window.chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Income",
          data: monthlyIncome,
          borderColor: "green",
          backgroundColor: "rgba(0,255,0,0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Expenses",
          data: monthlyExpense,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: true,

      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "center",

          labels: {
            usePointStyle: true,
            pointStyle: "box",
            boxWidth: 30,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ₹ ${context.raw.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function renderIncomeDoughnutChart(incomes) {
  const sourceMap = {};

  incomes.forEach((inc) => {
    const source = inc.sourceName || "Other";
    const amount = Number(inc.amount);

    if (!sourceMap[source]) {
      sourceMap[source] = 0;
    }

    sourceMap[source] += amount;
  });

  let entries = Object.entries(sourceMap);
  entries.sort((a, b) => b[1] - a[1]);

  const top3 = entries.slice(0, 3);

  const labels = top3.map((item) => item[0]);
  const data = top3.map((item) => item[1]);

  const ctx = document.getElementById("incomePieChart");

  if (window.incomeChart) {
    window.incomeChart.destroy();
  }

  window.incomeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["green", "blue", "orange"],
        },
      ],
    },
  });
}

function renderExpenseDoughnutChart(expenses) {
  const categoryMap = {};

  expenses.forEach((exp) => {
    const category = exp.category || "Other";
    const amount = Number(exp.amount);

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }

    categoryMap[category] += amount;
  });

  let entries = Object.entries(categoryMap);

  entries.sort((a, b) => b[1] - a[1]);

  const top3 = entries.slice(0, 3);

  const labels = top3.map((item) => item[0]);
  const data = top3.map((item) => item[1]);

  const ctx = document.getElementById("expensePieChart");

  if (window.expenseChart) {
    window.expenseChart.destroy();
  }

  window.expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["red", "blue", "orange"],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ₹ ${context.raw.toLocaleString()}`;
            },
          },
        },
      },
    },
  });
}

function renderRecentTransactions(incomes, expenses) {
  const tbody = document.getElementById("recentTransactionsBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  // merge both
  const all = [
    ...incomes.map((i) => ({ ...i, type: "Income" })),
    ...expenses.map((e) => ({ ...e, type: "Expense" })),
  ];

  // sort latest first
  all.sort((a, b) => new Date(b.date) - new Date(a.date));

  // take top 5
  const recent = all.slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr>
      <td colspan="5" class="text-center text-muted">
        No transactions found
      </td>
    </tr>`;
    return;
  }

  recent.forEach((item) => {
    const row = `
      <tr>
        <td>${item.type === "Income" ? "🟢 Income" : "🔴 Expense"}</td>
        <td>${item.sourceName}</td>
        <td>${item.category}</td>
        <td style="color:${item.type === "Income" ? "green" : "red"}">
          ₹ ${item.amount.toLocaleString()}
        </td>
        <td>${item.date}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}
