document.addEventListener("click", function (e) {
  if (e.target.classList.contains("nav-link")) {
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => link.classList.remove("active"));

    e.target.classList.add("active");
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
