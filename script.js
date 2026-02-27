let currentUser = null;

window.db = {
  accounts: JSON.parse(localStorage.getItem("accounts_db")) || [],
};

function handleRouting() {
  const hash = window.location.hash || "#/home";

  let cleanHash = hash.replace("/", "");

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.querySelector(cleanHash);
  if (targetPage) {
    targetPage.classList.add("active");
  }
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);

function handleRegistration(event) {
  event.preventDefault();

  const form = document.getElementById("registrationForm");
  const firstName = document.getElementById("reg-first-name").value;
  const lastname = document.getElementById("reg-last-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  if (password.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }

  const doesEmailExist = window.db.accounts.some((ac) => ac.email === email);

  if (doesEmailExist) {
    alert("This email is already registered!");
    return;
  }

  const registeredAccount = {
    firstName,
    lastname,
    email,
    password,
    verified: false,
  };

  window.db.accounts.push(registeredAccount);

  localStorage.setItem("unverified_email", email);

  localStorage.setItem("accounts_db", JSON.stringify(window.db.accounts));

  if (form) {
    form.reset();
  }

  navigateTo("#/verify-email");
}

function handleEmailVerification() {
  const email = localStorage.getItem("unverified_email");

  const targetAccount = window.db.accounts.find((ac) => ac.email === email);
  console.log(window.db.accounts);

  if (targetAccount) {
    targetAccount.verified = true;

    localStorage.setItem("accounts_db", JSON.stringify(window.db.accounts));
    localStorage.removeItem("unverified_email");
    alert("Email Verified!, Please Login.");
    navigateTo("#/login");
  }
}


function handleLogin(event){
    event.preventDefault();

    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;

    const accountValid = window.db.accounts.find(ac => ac.email === email && ac.password === password && ac.verified);

    if(accountValid){
        localStorage.setItem('auth_token', accountValid.email);
        currentUser = accountValid;
        setAuthState(accountValid, currentUser)
        navigateTo('#/profile')
    } else {
        alert("Error!")
    }

}

function setAuthState(isAuth, user){
    if(isAuth){
        document.body.classList.remove('not-authenticated');
        document.body.classList.add('authenticated');
        if(user.role === 'admin'){
            document.body.classList.add('is-admin')
        }
    }
}


function navigateTo(hash) {
  window.location.hash = hash;
}
