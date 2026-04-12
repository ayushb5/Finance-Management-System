document.addEventListener("click", function (e) {
  if (e.target.classList.contains("nav-link")) {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => link.classList.remove("active"));

    e.target.classList.add("active");
  }

  if (e.target.id === "sendMsg") {
    handleSendMsg();
  }
});

document.addEventListener("input", function (e) {
  const id = e.target.id;
  if (
    id === "contactName" ||
    id === "email" ||
    id === "subject" ||
    id === "message"
  ) {
    validateContact();
  }
});

function showToast(message, type = "success") {
  const toastEl = document.getElementById("toastElement");
  const toastBody = toastEl.querySelector(".toast-body");

  toastBody.innerText = message;

  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function updateNavbar() {
  const user =
    JSON.parse(localStorage.getItem("loggedUser")) ||
    JSON.parse(sessionStorage.getItem("loggedUser"));
  let authBtn = document.getElementById("authBtn");
  if (!authBtn) {
    return;
  }

  if (user) {
    authBtn.innerText = "Logout";
    authBtn.removeAttribute("data-bs-toggle");
    authBtn.removeAttribute("data-bs-target");
    authBtn.className = "btn btn-danger ms-2";

    authBtn.onclick = () => {
      localStorage.removeItem("loggedUser");
      sessionStorage.removeItem("loggedUser");
      showToast("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.reload();
      }, 900);
    };
  } else {
    authBtn.innerText = "Login";
    authBtn.setAttribute("data-bs-toggle", "modal");
    authBtn.setAttribute("data-bs-target", "#login");
  }
}

// input fields
function getFields() {
  return {
    contactName: document.getElementById("contactName"),
    email: document.getElementById("email"),
    subject: document.getElementById("subject"),
    message: document.getElementById("message"),
  };
}
// Errors
function getErrors() {
  return {
    nameError: document.getElementById("nameError"),
    emailError: document.getElementById("emailError"),
    subjectError: document.getElementById("subjectError"),
    msgError: document.getElementById("msgError"),
  };
}
async function handleSendMsg() {
  if (!validateContact()) return;

  const fields = getFields();
  const contactData = {
    name: fields.contactName.value.trim(),
    email: fields.email.value.trim(),
    subject: fields.subject.value.trim(),
    message: fields.message.value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await insertData("contacts", contactData);

    showToast("Message sent successfully!", "success");
    handleReset();
  } catch (err) {
    showToast("Failed to send message", "danger");
  }
}

function validateContact() {
  const fields = getFields();
  const errors = getErrors();

  const nameVal = fields.contactName.value.trim();
  const emailVal = fields.email.value.trim();
  const subjectVal = fields.subject.value.trim();
  const messageVal = fields.message.value.trim();
  let isValid = true;

  // Name
  if (nameVal === "") {
    errors.nameError.innerText = "Name is required";
    isValid = false;
  } else {
    errors.nameError.innerText = "";
  }
  // Email
  if (emailVal === "") {
    errors.emailError.innerText = "Email is required";
    isValid = false;
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailVal)
  ) {
    errors.emailError.innerText = "Invalid Email format";
    isValid = false;
  } else {
    errors.emailError.innerText = "";
  }
  // Subject
  if (subjectVal === "") {
    errors.subjectError.innerText = "Subject is required";
    isValid = false;
  } else {
    errors.subjectError.innerText = "";
  }
  // Message
  if (messageVal === "") {
    errors.msgError.innerText = "Message is required";
    isValid = false;
  } else {
    errors.msgError.innerText = "";
  }

  return isValid;
}

function handleReset() {
  const fields = getFields();
  const errors = getErrors();
  Object.values(fields).forEach((field) => {
    field.value = "";
  });
  Object.values(errors).forEach((err) => {
    err.innerText = "";
  });
}
