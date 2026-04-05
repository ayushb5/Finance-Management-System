function initAuth() {
  const signupName = document.getElementById("signupName");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const confirmPass = document.getElementById("confirmPass");

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

  function signUpValidate() {
    let name = signupName.value.trim();
    let email = signupEmail.value.trim();
    let password = signupPassword.value.trim();
    let cp = confirmPass.value.trim();
    let isValid = true;
    // Name
    let signupNameError = document.getElementById("signupNameError");

    if (name === "") {
      signupNameError.innerText = "Name is required";
    } else if (name.length < 3) {
      signupNameError.innerText = "Invalid name (min 3 characters)";
    } else {
      signupNameError.innerText = "";
    }

    // Email
    let signupEmailError = document.getElementById("signupEmailError");
    if (email === "") {
      signupEmailError.innerText = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      signupEmailError.innerText = "Invalid Email format";
    } else {
      signupEmailError.innerText = "";
    }

    // Password
    let signupPassError = document.getElementById("signupPassError");
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (password === "") {
      signupPassError.innerText = "Password is required";
    } else if (!passwordRegex.test(password)) {
      signupPassError.innerText =
        "Password must be at least 6 characters, include uppercase, lowercase, number, and special character";
    } else {
      signupPassError.innerText = "";
    }

    // Confirm Password
    let cpError = document.getElementById("cpError");
    if (cp === "") {
      cpError.innerText = "Please confirm your password";
    } else if (password !== cp) {
      cpError.innerText = "Passwords do not match";
    } else {
      cpError.innerText = "";
    }
  }
}
