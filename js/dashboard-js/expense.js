let editExpenseId = null;
function getLoggedUser() {
  return (
    JSON.parse(localStorage.getItem("loggedUser")) ||
    JSON.parse(sessionStorage.getItem("loggedUser"))
  );
}
function initExpense() {
  const expenseData = {
    sourceName: document.getElementById("sourceName"),
    category: document.getElementById("category"),
    amount: document.getElementById("amount"),
    date: document.getElementById("date"),
    description: document.getElementById("description"),
    customCategory: document.getElementById("customCategory"),
  };

  const addExpenseBtn = document.getElementById("addExpenseBtn");
  // Error fields
  const errors = {
    sourceError: document.getElementById("sourceError"),
    categoryError: document.getElementById("categoryError"),
    amountError: document.getElementById("amountError"),
    dateError: document.getElementById("dateError"),
    descError: document.getElementById("descError"),
    custCatError: document.getElementById("custCatError"),
  };

  const otherInput = document.getElementById("customCategory").closest(".mb-3");

  expenseData.category.onchange = function (e) {
    if (e.target.value === "Other") {
      otherInput.classList.remove("d-none");
    } else {
      otherInput.classList.add("d-none");
      expenseData.customCategory.value = "";
    }

    validateExpense(expenseData, errors);
  };

  Object.values(expenseData).forEach((field) => {
    field.oninput = () => validateExpense(expenseData, errors);
  });

  addExpenseBtn.onclick = async function (e) {
    e.preventDefault();
    if (!validateExpense(expenseData, errors)) return;

    const loggedUser = getLoggedUser();

    const userData = await getData(`users/${loggedUser.id}`);

    if (!userData.transactions) {
      userData.transactions = {
        income: [],
        expenses: [],
      };
    }

    const expense = {
      id: Date.now(),
      sourceName: expenseData.sourceName.value.trim(),
      category:
        expenseData.category.value === "Other"
          ? expenseData.customCategory.value.trim()
          : expenseData.category.value,
      amount: Number(expenseData.amount.value),
      date: expenseData.date.value,
      description: expenseData.description.value.trim(),
    };

    if (editExpenseId) {
      userData.transactions.expenses = userData.transactions.expenses.map(
        (item) =>
          item.id === editExpenseId ? { ...expense, id: editExpenseId } : item,
      );
    } else {
      userData.transactions.expenses.push(expense);
    }

    await updateData("users", loggedUser.id, {
      transactions: userData.transactions,
    });
    showToast(
      editExpenseId
        ? "Expense Updated Successfully"
        : "Expense Added Successfully",
      "success",
    );
    loadExpenseCards();
    // Hide modal
    const modalEl = bootstrap.Modal.getInstance(
      document.getElementById("addExpense"),
    );

    modalEl.hide();

    handleReset();
  };

  const cancelBtn = document.getElementById("cancelExpenseBtn");
  const btnClose = document.querySelector("#addExpense .btn-close");
  cancelBtn.onclick = handleReset;
  btnClose.onclick = handleReset;

  function handleReset() {
    expenseData.sourceName.value = "";
    expenseData.category.value = "";
    expenseData.amount.value = "";
    expenseData.date.value = "";
    expenseData.description.value = "";
    expenseData.customCategory.value = "";

    otherInput.classList.add("d-none");

    Object.values(errors).forEach((err) => (err.innerText = ""));

    editExpenseId = null;
    document.getElementById("addExpenseBtn").innerText = "Add Expense";
    document.querySelector("#addExpense .modal-header h3").innerText =
      "Add Expense";
  }

  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.classList.remove("active");

    if (Number(btn.dataset.month) === expenseSelectedMonth) {
      btn.classList.add("active");
    }
    btn.onclick = function () {
      document
        .querySelectorAll(".month-btn")
        .forEach((b) => b.classList.remove("active"));

      this.classList.add("active");

      expenseSelectedMonth = Number(this.dataset.month);
      loadExpenseCards();
    };
  });

  // Select month for expense table view
  const dropdown = document.getElementById("monthDropdown");

  dropdown.addEventListener("change", function () {
    if (this.value !== "") {
      expenseSelectedMonth = Number(this.value);
      loadExpenseCards();
    }
  });
  loadExpenseCards();
}

//   Expense info cards
async function loadExpenseCards() {
  const loggedUser = getLoggedUser();

  const userData = await getData(`users/${loggedUser.id}`);
  const expenses = userData.transactions?.expenses || [];
  updateExpenseCards(expenses);
  renderExpenseTable(expenses);
}

function validateExpense(expenseData, errors) {
  let sourceName = expenseData.sourceName.value.trim();
  let category = expenseData.category.value;
  let amount = expenseData.amount.value;
  let date = expenseData.date.value;
  let description = expenseData.description.value.trim();
  let customCategory = expenseData.customCategory.value.trim();
  let isValid = true;

  if (sourceName === "") {
    errors.sourceError.innerText = "Source Name Required.";
    isValid = false;
  } else {
    errors.sourceError.innerText = "";
  }

  if (category === "") {
    errors.categoryError.innerText = "Select Category";
    isValid = false;
  } else {
    errors.categoryError.innerText = "";
  }

  if (category === "Other" && customCategory === "") {
    errors.custCatError.innerText = "Enter Custom Category";
    isValid = false;
  } else {
    errors.custCatError.innerText = "";
  }

  if (amount === "" || amount <= 0) {
    errors.amountError.innerText = "Enter valid amount";
    isValid = false;
  } else {
    errors.amountError.innerText = "";
  }

  if (date === "") {
    errors.dateError.innerText = "Select date";
    isValid = false;
  } else {
    errors.dateError.innerText = "";
  }

  if (description === "") {
    errors.descError.innerText = "Description is required";
    isValid = false;
  } else {
    errors.descError.innerText = "";
  }

  return isValid;
}

function updateExpenseCards(expenses) {
  const totalEl = document.getElementById("total");
  const currentMonthEl = document.getElementById("currentMonth");
  const lastMonthEl = document.getElementById("lastMonth");
  const sourcesEl = document.getElementById("sources");

  let totalExpense = 0;
  let thisMonthExpense = 0;
  let lastMonthExpense = 0;

  const uniqueSources = new Set();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    totalExpense += amount;

    uniqueSources.add(expense.sourceName);
    const d = new Date(expense.date);
    const m = d.getMonth();
    const y = d.getFullYear();

    if (m === currentMonth && y === currentYear) {
      thisMonthExpense += amount;
    }

    if (m === prevMonth && y === prevYear) {
      lastMonthExpense += amount;
    }
  });

  totalEl.innerText = totalExpense.toLocaleString();
  currentMonthEl.innerText = thisMonthExpense.toLocaleString();
  lastMonthEl.innerText = lastMonthExpense.toLocaleString();
  sourcesEl.innerText = uniqueSources.size;
}

let expenseSelectedMonth = new Date().getMonth();

function renderExpenseTable(expenses) {
  const tbody = document.getElementById("expenseTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let currentYear = new Date().getFullYear();

  let filtered = expenses.filter((expense) => {
    if (!expense.date) return false;

    const d = new Date(expense.date);
    if (isNaN(d)) return false;

    return (
      d.getMonth() === expenseSelectedMonth && d.getFullYear() === currentYear
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr>
      <td colspan="7" class="text-center text-muted">
        No expense data for this month
      </td>
    </tr>`;
    return;
  }

  filtered.forEach((expense, index) => {
    const row = `
    <tr>
      <td>${index + 1}</td>
      <td>${expense.sourceName}</td>
      <td>${expense.category}</td>
      <td>₹ ${expense.amount.toLocaleString()}</td>
      <td>${expense.date}</td>
      <td class="description-cell">${expense.description}</td>
      <td class="gap-2">
              <button class="btn btn-primary btn-sm edit-btn" data-id="${expense.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}">
                <i class="bi bi-trash"></i>
              </button>
      </td>
    </tr>
    `;

    tbody.innerHTML += row;
  });

  // Delete Event Listener
  let deleteId = null;

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = function () {
      deleteId = Number(this.dataset.id);

      const modal = new bootstrap.Modal(
        document.getElementById("confirmDeletion"),
      );
      modal.show();

      const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
      confirmDeleteBtn.onclick = () => handleDelete(deleteId);
    };
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = function () {
      const id = Number(this.dataset.id);
      handleUpdate(id);
    };
  });
}
async function handleDelete(deleteId) {
  try {
    const loggedUser = getLoggedUser();

    const userData = await getData(`users/${loggedUser.id}`);

    userData.transactions.expenses = userData.transactions.expenses.filter(
      (item) => item.id !== deleteId,
    );

    await updateData("users", loggedUser.id, {
      transactions: userData.transactions,
    });

    const modalEl = bootstrap.Modal.getInstance(
      document.getElementById("confirmDeletion"),
    );
    modalEl.hide();
    showToast("Expense Deleted Successfully", "success");
    loadExpenseCards();
  } catch (error) {
    showToast(error, "danger");
  }
}

async function handleUpdate(id) {
  editExpenseId = id;
  const loggedUser = getLoggedUser();

  const userData = await getData(`users/${loggedUser.id}`);
  const expense = userData.transactions.expenses.find((i) => i.id === id);

  document.querySelector("#addExpense .modal-header h3").innerText =
    "Update Expense";

  document.getElementById("sourceName").value = expense.sourceName;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("date").value = expense.date;
  document.getElementById("description").value = expense.description;

  const categoryDropdown = document.getElementById("category");
  const customCategory = document
    .getElementById("customCategory")
    .closest(".mb-3");

  if (
    [
      "Food",
      "Transportation",
      "Household",
      "Bills & Recharge",
      "Shopping",
      "Health",
      "Education",
      "Social Work",
    ].includes(expense.category)
  ) {
    categoryDropdown.value = expense.category;
    customCategory.classList.add("d-none");
  } else {
    categoryDropdown.value = "Other";
    document.getElementById("customCategory").value = expense.category;
    customCategory.classList.remove("d-none");
  }

  document.getElementById("addExpenseBtn").innerText = "Update Expense";
  const modal = new bootstrap.Modal(document.getElementById("addExpense"));
  modal.show();
}
