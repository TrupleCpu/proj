const STORAGE_KEY = 'ipt_demo_v1';
let currentUser = null;

function loadFromStorage(){
  const data = localStorage.getItem(STORAGE_KEY);
  
  if(data){
     window.db = JSON.parse(data);
  } else {

     window.db = {
      accounts: [
        {
          firstName: "Admin",
          lastname: "User",
          email: "admin@example.com",
          password: "Password123!",
          role: "admin",
          verified: true,
        },
      ],
      departments: [
        {
          deptName: "Engineering",
          deptDesc: "Software Team"
        }, 
        {
          deptName: "HR",
          deptDesc: "Human Resources"
        }
      ],
      employees: []
    };

    saveToStorage();
    
  }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db))
}

function handleRouting() {
  const hash = window.location.hash || "#/home";

  let cleanHash = hash.replace("/", "");

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.querySelector(cleanHash);

  if (
    targetPage.classList.contains("role-admin") &&
    !document.body.classList.contains("is-admin")
  ) {
    alert("Access denied! admins only.");
    return navigateTo("#/profile");
  }
  targetPage.classList.add("active");
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);

function handleRegistration(event) {
  event.preventDefault();

  const form = document.getElementById("registrationForm");
  const firstName = document.getElementById("reg-first-name").value;
  const lastName = document.getElementById("reg-last-name").value;
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
    lastName,
    email,
    password,
    role: "user",
    verified: false,
  };

  window.db.accounts.push(registeredAccount);

  localStorage.setItem("unverified_email", email);

  saveToStorage();

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

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("log-email").value;
  const password = document.getElementById("log-password").value;

  const accountValid = window.db.accounts.find(
    (ac) => ac.email === email && ac.password === password && ac.verified,
  );
  console.log(accountValid.role);
  if (accountValid) {
    localStorage.setItem("auth_token", accountValid.email);
    currentUser = accountValid;
    setAuthState(accountValid, currentUser);
    navigateTo("#/profile");
  } else {
    alert("Error!");
  }
}

function setAuthState(isAuth, user) {
  if (isAuth) {
    document.body.classList.remove("not-authenticated");
    document.body.classList.add("authenticated");
    if (user.role === "admin") {
      document.body.classList.add("is-admin");
    }
  }
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function toggleAccountForm() {
  const formContainer = document.getElementById("account-form-container");
  formContainer.classList.toggle("d-none");

  if (!formContainer.classList.contains("d-none")) {
    document.querySelector("#account-form-container form").reset();
  }
}

function toggleEmployeeForm() {
  const formContainer = document.getElementById("employee-form-container");
  formContainer.classList.toggle("d-none");

  if (!formContainer.classList.contains("d-none")) {
    document.querySelector("#employee-form-container form").reset();
  }
}


function toggleDeptForm() {
  const formContainer = document.getElementById("dept-form-container");
  formContainer.classList.toggle("d-none");

  if (!formContainer.classList.contains("d-none")) {
    document.querySelector("#dept-form-container form").reset();
  }
}

function addRow() {
  const itemList = document.getElementById("modal-item-list");

  const newRow = document.createElement("div");
  newRow.className = "d-flex gap-2 mb-2 align-items-center";

  newRow.innerHTML = `
        <input
            type="text"
            class="form-control"
            placeholder="Item name"
        />
        <input type="number" class="form-control w-25" value="1" />
        <button
            type="button"
            class="btn btn-outline-danger px-2"
            onclick="this.parentElement.remove()"
        >
            x
        </button>
    `;

  itemList.appendChild(newRow);
}

function handleEmployeeSubmit(event){
  event.preventDefault();

  const form = document.getElementById("employee-form-containe");
  const employeeId = document.getElementById("emp-id").value;
  const employeeEmail = document.getElementById("emp-email").value;
  const employeePosition = document.getElementById("emp-position").value;
  const employeeDepartment = document.getElementById("emp-dept").value;
  const employeeHiredDate = document.getElementById("emp-hire-date").value;


  if(!employeeId || !employeeEmail || !employeePosition || !employeeDepartment || !employeeHiredDate){
     alert("Empty fields!");
     return;
  }

  const doesIdExist = window.db.employees.some((ac) => ac.id === employeeId);

   if (doesIdExist) {
    alert("This id is already exist!");
    return;
  }

  const insertEmployee = {
    id: employeeId,
    email: employeeEmail,
    position: employeePosition,
    department: employeeDepartment,
    hireDate: employeeHiredDate
  }

  window.db.employees.push(insertEmployee);


  localStorage.setItem("employees_db", JSON.stringify(window.db.employees));

  if (form) {
    form.reset();
  }

}

function handleDeptSubmit(event){
  event.preventDefault();

  const form = document.getElementById("department-form");
  const departmentName = document.getElementById("dept-name").value.trim();
  const departmentDescription = document.getElementById("dept-desc").value.trim();
  

  if(!departmentName || !departmentDescription){
    alert("Empty field!");
    return;
  }


  const insertDepartment = {
    deptName: departmentName,
    deptDesc: departmentDescription
  }


  window.db.departments.push(insertDepartment);

  saveToStorage()

  if(form){
    form.reset();
  }
}

function handleAccountSubmit(event){
  event.preventDefault();
  
  const firstName = document.getElementById("acc-first-name").value;
  const lastName = document.getElementById("acc-last-name").value;
  const email = document.getElementById("acc-email").value;
  const password = document.getElementById("acc-password").value;
  const role = document.getElementById("acc-role").value;
  const verified = document.getElementById("acc-verified").checked;

  if(!firstName || !lastName || !email || !password){
    alert("Empty fields!");
    return;
  }

  const insertAccount = {
    firstName,
    lastName,
    email,
    password,
    role,
    verified
  }
  
  const doesEmailExist = window.db.accounts.some((ac) => ac.email === email);

  if (doesEmailExist) {
    alert("This email is already registered!");
    return;
  }

  if(!verified){
      localStorage.setItem("unverified_email", email);

  }

  window.db.accounts.push(insertAccount)

  saveToStorage()
}

loadFromStorage()