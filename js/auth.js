export function initAuth() {
  // --------------------------------------
  // 1. Signup Part
  // --------------------------------------

  // Signup Input fields
  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const confirmPass = document.getElementById("confirmPass");

  // Signup Error fields
  let signupNameError = document.getElementById("signupNameError");
  let signupEmailError = document.getElementById("signupEmailError");
  let signupPassError = document.getElementById("signupPassError");
  let cpError = document.getElementById("cpError");

  // Signup Btn
  const signupBtn = document.getElementById("signupBtn");

  // Clear signup fields if model hidden
  const signupModalEl = document.getElementById("signup");

  if (signupModalEl) {
    signupModalEl.addEventListener("hidden.bs.modal", handleSignUpReset);
  }

  let signupData = {
    signupName,
    signupEmail,
    signupPassword,
    confirmPass,
  };

  if (signupName && signupEmail && signupPassword && confirmPass) {
    Object.values(signupData).forEach((input) => {
      input.addEventListener("input", signUpValidate);
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", handleSignup);
  }

  function signUpValidate() {
    let name = signupName.value.trim();
    let email = signupEmail.value.trim();
    let password = signupPassword.value.trim();
    let cp = confirmPass.value.trim();
    let isValid = true;
    // Name
    if (name === "") {
      signupNameError.innerText = "Name is required";
      isValid = false;
    } else if (name.length < 3) {
      signupNameError.innerText = "Invalid name (min 3 characters)";
      isValid = false;
    } else {
      signupNameError.innerText = "";
      isValid = true;
    }

    // Email
    if (email === "") {
      signupEmailError.innerText = "Email is required";
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      signupEmailError.innerText = "Invalid Email format";
      isValid = false;
    } else {
      signupEmailError.innerText = "";
      isValid = true;
    }

    // Password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (password === "") {
      signupPassError.innerText = "Password is required";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      signupPassError.innerText =
        "Password must be at least 6 characters, include uppercase, lowercase, number, and special character";
      isValid = false;
    } else {
      signupPassError.innerText = "";
      isValid = true;
    }

    // Confirm Password
    if (cp === "") {
      cpError.innerText = "Please confirm your password";
      isValid = false;
    } else if (password !== cp) {
      cpError.innerText = "Passwords do not match";
      isValid = false;
    } else {
      cpError.innerText = "";
      isValid = true;
    }

    return isValid;
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (signUpValidate()) {
      const userData = {
        name: signupName.value.trim(),
        email: signupEmail.value.trim(),
        signupPassword: signupPassword.value.trim(),
      };

      const users = await getData("users");
      const emailExists = users.find((user) => user.email === userData.email);

      if (emailExists) {
        showToast("Account already exists. Please login", "warning");
        handleSignUpReset();
        return;
      }

      const result = await insertData("users", userData);
      if (result) {
        showToast("Account created successfully. Please log in.");
        handleSignUpReset();
        // Redirect to login Modal
        const signupModal = bootstrap.Modal.getInstance(
          document.getElementById("signup"),
        );
        if (signupModal) {
          signupModal.addEventListener("hidden.bs.modal", handleSignUpReset);
        }
        // clear signup fields
        setTimeout(() => {
          signupModal.hide();

          const loginModal = new bootstrap.Modal(
            document.getElementById("login"),
          );

          loginModal.show();
        }, 1000);
      }
    }
  }

  function handleSignUpReset() {
    // Clear Input fields
    signupName.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    confirmPass.value = "";

    // Clear Error fields
    signupNameError.innerText = "";
    signupEmailError.innerText = "";
    signupPassError.innerText = "";
    cpError.innerText = "";
  }

  // --------------------------------------
  // 1. Login Part
  // --------------------------------------

  // Login Input fields
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const rememberMe = document.getElementById("rememberMe");

  // Login Error fields
  const loginEmailError = document.getElementById("loginEmailError");
  const loginPassError = document.getElementById("loginPassError");

  // Login Btn
  const loginBtn = document.getElementById("loginBtn");

  // Clear signup fields if model hidden
  const loginModalEl = document.getElementById("login");

  if (loginModalEl) {
    loginModalEl.addEventListener("hidden.bs.modal", handleLoginReset);
  }

  let loginData = {
    loginEmail,
    loginPassword,
  };

  if (loginEmail && loginPassword) {
    Object.values(loginData).forEach((input) => {
      input.addEventListener("input", loginValidate);
    });
  }

  function loginValidate() {
    let email = loginEmail.value.trim();
    let password = loginPassword.value.trim();
    let isValid = true;

    // Email
    if (email === "") {
      loginEmailError.innerText = "Email is required";
      isValid = false;
    } else {
      loginEmailError.innerText = "";
      isValid = true;
    }

    // Password
    if (password === "") {
      loginPassError.innerText = "Password is required";
      isValid = false;
    } else {
      loginPassError.innerText = "";
      isValid = true;
    }

    return isValid;
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (loginValidate()) {
      const users = await getData("users");

      const user = users.find(
        (u) =>
          u.email === loginEmail.value.trim() &&
          u.signupPassword === loginPassword.value.trim(),
      );

      if (!user) {
        showToast("Invalid email or password", "danger");
        return;
      }

      showToast("Login successful", "success");
      const sessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      if (rememberMe.checked) {
        localStorage.setItem("loggedUser", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("loggedUser", JSON.stringify(sessionData));
      }
      handleLoginReset();

      const loginModal = bootstrap.Modal.getInstance(
        document.getElementById("login"),
      );

      if (loginModal) loginModal.hide();

      setTimeout(() => {
        window.location.href = "/dashboard/dashboard.html";
      }, 200);
    }
  }

  function handleLoginReset() {
    loginEmail.value = "";
    loginPassword.value = "";

    loginEmailError.innerText = "";
    loginPassError.innerText = "";
  }
}
