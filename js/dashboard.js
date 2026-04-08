document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  handleSidebarNav();
  loadDefaultPage();
});

let user =
  JSON.parse(localStorage.getItem("loggedUser")) ||
  JSON.parse(sessionStorage.getItem("loggedUser"));

function checkAuth() {
  if (!user) {
    window.location.href = "../index.html";
  }
}

function handleSidebarNav() {
  const links = document.querySelectorAll(".nav-link");
  const main = document.getElementById("main-content");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const page = this.getAttribute("data-page");

      if (page) {
        fetch(page)
          .then((res) => res.text())
          .then((data) => {
            main.innerHTML = data;
            if (page.includes("profile")) {
              loadProfile();
            }
          });
      }

      links.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

function loadDefaultPage() {
  const activeLink = document.querySelector(".nav-link.active");
  const main = document.getElementById("main-content");

  if (activeLink) {
    const page = activeLink.getAttribute("data-page");

    if (page) {
      fetch(page)
        .then((res) => res.text())
        .then((data) => {
          main.innerHTML = data;
          if (page.includes("profile")) {
            loadProfile();
          }
        });
    }
  }
}

function loadProfile() {
  const firstLetter = document.getElementById("firstLetter");
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");

  const editName = document.getElementById("editName");
  const editEmail = document.getElementById("editEmail");
  if (!user) return;

  if (firstLetter) firstLetter.innerText = user.name.charAt(0).toUpperCase();
  if (profileName) profileName.innerText = user.name;
  if (profileEmail) profileEmail.innerText = user.email;

  if (editName) editName.value = user.name;
  if (editEmail) editEmail.value = user.email;
}

async function editProfile() {
  const name = document.getElementById("editName");
  const email = document.getElementById("editEmail");

  // error
  let isValid = true;
  const nameError = document.getElementById("nameError");
  if (name.value.trim() === "") {
    nameError.innerText = "Name is required";
    isValid = false;
  } else {
    nameError.innerText = "";
  }

  const emailError = document.getElementById("emailError");
  if (email.value.trim() === "") {
    emailError.innerText = "Email is required";
    isValid = false;
  } else if (
    !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)
  ) {
    emailError.innerText = "Invalid email format";
    isValid = false;
  } else {
    emailError.innerText = "";
  }
  if (!isValid) return;

  const usersRes = await fetch(
    "https://69d340ac336103955f8eb706.mockapi.io/users",
  );
  const users = await usersRes.json();

  const emailExists = users.find(
    (u) => u.email === email.value.trim() && u.id !== user.id,
  );

  if (emailExists) {
    emailError.innerText = "Email already in use";
    return;
  }

  try {
    const res = await fetch(
      `https://69d340ac336103955f8eb706.mockapi.io/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.value,
          email: email.value,
        }),
      },
    );

    const updatedUser = await res.json();

    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
    sessionStorage.setItem("loggedUser", JSON.stringify(updatedUser));

    user = updatedUser;

    loadProfile();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editProfile"),
    );
    if (modal) modal.hide();
    showToast("Profile Updated Successfully", "success");
  } catch (error) {
    showToast(error, "danger");
  }
}

async function changePass() {
  const currentPass = document.getElementById("currentPass");
  const newPass = document.getElementById("newPass");
  const confirmNewPass = document.getElementById("confirmNewPass");

  // Error fields
  const currentPassError = document.getElementById("currentPassError");
  const newPassError = document.getElementById("newPassError");
  const confirmNewPassError = document.getElementById("confirmNewPassError");

  // Validation
  let isValid = true;
  if (currentPass.value.trim() === "") {
    currentPassError.innerText = "Current password required";
    isValid = false;
  } else {
    currentPassError.innerText = "";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  if (newPass.value.trim() === "") {
    newPassError.innerText = "New password required";
    isValid = false;
  } else if (newPass.value === currentPass.value) {
    newPassError.innerText = "New password cannot be same as current password";
    isValid = false;
  } else if (!passwordRegex.test(newPass.value)) {
    newPassError.innerText =
      "Password must be at least 6 characters, include uppercase, lowercase, number, and special character";
    isValid = false;
  } else {
    newPassError.innerText = "";
  }

  if (confirmNewPass.value.trim() != newPass.value.trim()) {
    confirmNewPassError.innerText = "Passwords do not match";
    isValid = false;
  } else {
    confirmNewPassError.innerText = "";
  }

  if (!isValid) return;

  try {
    const res = await fetch(
      `https://69d340ac336103955f8eb706.mockapi.io/users/${user.id}`,
    );
    const userData = await res.json();

    if (userData.signupPassword != currentPass.value.trim()) {
      showToast("Invalid Current Password. Enter correct password.", "danger");
      currentPass.value = "";
      return;
    }

    const updateRes = await fetch(
      `https://69d340ac336103955f8eb706.mockapi.io/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signupPassword: newPass.value.trim(),
        }),
      },
    );
    await updateRes.json();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("changePass"),
    );

    if (modal) modal.hide();

    showToast("Password updated successfully", "success");
  } catch (error) {
    showToast(error, "danger");
  }
}
