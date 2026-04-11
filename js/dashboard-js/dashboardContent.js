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
