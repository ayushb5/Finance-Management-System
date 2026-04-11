let editIncomeId = null;
function getLoggedUser() {
  return (
    JSON.parse(localStorage.getItem("loggedUser")) ||
    JSON.parse(sessionStorage.getItem("loggedUser"))
  );
}
function initIncome() {
  const incomeData = {
    sourceName: document.getElementById("sourceName"),
    category: document.getElementById("category"),
    amount: document.getElementById("amount"),
    date: document.getElementById("date"),
    description: document.getElementById("description"),
    customCategory: document.getElementById("customCategory"),
  };

  const addIncomeBtn = document.getElementById("addIncomeBtn");
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

  incomeData.category.onchange = function (e) {
    if (e.target.value === "Other") {
      otherInput.classList.remove("d-none");
    } else {
      otherInput.classList.add("d-none");
      incomeData.customCategory.value = "";
    }

    validateIncome(incomeData, errors);
  };

  Object.values(incomeData).forEach((field) => {
    field.oninput = () => validateIncome(incomeData, errors);
  });

  addIncomeBtn.onclick = async function (e) {
    e.preventDefault();
    if (!validateIncome(incomeData, errors)) return;

    const loggedUser = getLoggedUser();

    const userData = await getData(`users/${loggedUser.id}`);

    if (!userData.transactions) {
      userData.transactions = {
        income: [],
        expenses: [],
      };
    }

    const income = {
      id: Date.now(),
      sourceName: incomeData.sourceName.value.trim(),
      category:
        incomeData.category.value === "Other"
          ? incomeData.customCategory.value.trim()
          : incomeData.category.value,
      amount: Number(incomeData.amount.value),
      date: incomeData.date.value,
      description: incomeData.description.value.trim(),
    };

    if (editIncomeId) {
      userData.transactions.income = userData.transactions.income.map((item) =>
        item.id === editIncomeId ? { ...income, id: editIncomeId } : item,
      );
    } else {
      userData.transactions.income.push(income);
    }

    await updateData("users", loggedUser.id, {
      transactions: userData.transactions,
    });
    showToast(
      editIncomeId
        ? "Income Updated Successfully"
        : "Income Added Successfully",
      "success",
    );
    loadIncomeCards();
    // Hide modal
    const modalEl = bootstrap.Modal.getInstance(
      document.getElementById("addIncome"),
    );

    modalEl.hide();

    handleReset();
  };

  const cancelBtn = document.getElementById("cancelIncomeBtn");
  const btnClose = document.querySelector("#addIncome .btn-close");
  cancelBtn.onclick = handleReset;
  btnClose.onclick = handleReset;

  function handleReset() {
    incomeData.sourceName.value = "";
    incomeData.category.value = "";
    incomeData.amount.value = "";
    incomeData.date.value = "";
    incomeData.description.value = "";
    incomeData.customCategory.value = "";

    otherInput.classList.add("d-none");

    Object.values(errors).forEach((err) => (err.innerText = ""));

    editIncomeId = null;
    document.getElementById("addIncomeBtn").innerText = "Add Income";
    document.querySelector("#addIncome .modal-header h3").innerText =
      "Add Income";
  }

  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.classList.remove("active");

    if (Number(btn.dataset.month) === incomeSelectedMonth) {
      btn.classList.add("active");
    }
    btn.onclick = function () {
      document
        .querySelectorAll(".month-btn")
        .forEach((b) => b.classList.remove("active"));

      this.classList.add("active");

      incomeSelectedMonth = Number(this.dataset.month);
      loadIncomeCards();
    };
  });

  // Select month for income table view
  const dropdown = document.getElementById("monthDropdown");

  dropdown.addEventListener("change", function () {
    if (this.value !== "") {
      incomeSelectedMonth = Number(this.value);
      loadIncomeCards();
    }
  });
  loadIncomeCards();
}

//   Income info cards
async function loadIncomeCards() {
  const loggedUser = getLoggedUser();

  const userData = await getData(`users/${loggedUser.id}`);
  const incomes = userData.transactions?.income || [];
  updateIncomeCards(incomes);
  renderIncomeTable(incomes);
}

function validateIncome(incomeData, errors) {
  let sourceName = incomeData.sourceName.value.trim();
  let category = incomeData.category.value;
  let amount = incomeData.amount.value;
  let date = incomeData.date.value;
  let description = incomeData.description.value.trim();
  let customCategory = incomeData.customCategory.value.trim();
  let isValid = true;

  if (sourceName === "") {
    errors.sourceError.innerText = "Source Name Required.";
    isValid = false;
  } else {
    errors.sourceError.innerText = "";
  }

  if (category === "Select category") {
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

function updateIncomeCards(incomes) {
  const totalEl = document.getElementById("total");
  const currentMonthEl = document.getElementById("currentMonth");
  const lastMonthEl = document.getElementById("lastMonth");
  const sourcesEl = document.getElementById("sources");

  let totalIncome = 0;
  let thisMonthIncome = 0;
  let lastMonthIncome = 0;

  const uniqueSources = new Set();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  incomes.forEach((income) => {
    const amount = Number(income.amount);
    totalIncome += amount;

    uniqueSources.add(income.sourceName);
    const d = new Date(income.date);
    const m = d.getMonth();
    const y = d.getFullYear();

    if (m === currentMonth && y === currentYear) {
      thisMonthIncome += amount;
    }

    if (m === prevMonth && y === prevYear) {
      lastMonthIncome += amount;
    }
  });

  totalEl.innerText = totalIncome.toLocaleString();
  currentMonthEl.innerText = thisMonthIncome.toLocaleString();
  lastMonthEl.innerText = lastMonthIncome.toLocaleString();
  sourcesEl.innerText = uniqueSources.size;
}

let incomeSelectedMonth = new Date().getMonth();

function renderIncomeTable(incomes) {
  const tbody = document.getElementById("incomeTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let currentYear = new Date().getFullYear();

  let filtered = incomes.filter((income) => {
    if (!income.date) return false;

    const d = new Date(income.date);
    if (isNaN(d)) return false;

    return (
      d.getMonth() === incomeSelectedMonth && d.getFullYear() === currentYear
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr>
      <td colspan="7" class="text-center text-muted">
        No income data for this month
      </td>
    </tr>`;
    return;
  }

  filtered.forEach((income, index) => {
    const row = `
    <tr>
      <td>${index + 1}</td>
      <td>${income.sourceName}</td>
      <td>${income.category}</td>
      <td>₹ ${income.amount.toLocaleString()}</td>
      <td>${income.date}</td>
      <td class="description-cell">${income.description}</td>
      <td class="gap-2">
              <button class="btn btn-primary btn-sm edit-btn" data-id="${income.id}">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${income.id}">
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

    userData.transactions.income = userData.transactions.income.filter(
      (item) => item.id !== deleteId,
    );

    await updateData("users", loggedUser.id, {
      transactions: userData.transactions,
    });

    const modalEl = bootstrap.Modal.getInstance(
      document.getElementById("confirmDeletion"),
    );
    modalEl.hide();
    showToast("Income Deleted Successfully", "success");
    loadIncomeCards();
  } catch (error) {
    showToast(error, "danger");
  }
}

async function handleUpdate(id) {
  editIncomeId = id;
  const loggedUser = getLoggedUser();

  const userData = await getData(`users/${loggedUser.id}`);
  const income = userData.transactions.income.find((i) => i.id === id);

  document.querySelector("#addIncome .modal-header h3").innerText =
    "Update Income";

  document.getElementById("sourceName").value = income.sourceName;
  document.getElementById("amount").value = income.amount;
  document.getElementById("date").value = income.date;
  document.getElementById("description").value = income.description;

  const categoryDropdown = document.getElementById("category");
  const customCategory = document
    .getElementById("customCategory")
    .closest(".mb-3");

  if (
    ["Salary", "Gift", "Bonus", "Freelance", "Investment"].includes(
      income.category,
    )
  ) {
    categoryDropdown.value = income.category;
    customCategory.classList.add("d-none");
  } else {
    categoryDropdown.value = "Other";
    document.getElementById("customCategory").value = income.category;
    customCategory.classList.remove("d-none");
  }

  document.getElementById("addIncomeBtn").innerText = "Update Income";
  const modal = new bootstrap.Modal(document.getElementById("addIncome"));
  modal.show();
}
