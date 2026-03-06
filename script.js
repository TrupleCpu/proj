const STORAGE_KEY = 'ipt_demo_v1';
let currentUser = null;
const routes = {
  '/accounts': renderAccounts,
  '/employees': renderEmployees,
  '/departments': renderDepartments
};

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
          role: "Admin",
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


  const savedToken = localStorage.getItem("auth_token");
  if(savedToken){
    
    const activeUser = window.db.accounts.find(ac => ac.email === savedToken)
    
    if(activeUser){
      currentUser = activeUser;
      console.log(currentUser)
      setAuthState(true, currentUser)
    }
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

  let routeKey = cleanHash.replace("#", "/");

  if(routes[routeKey]){
    routes[routeKey]();
  }

}



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
    if (user.role.toLowerCase() === "admin") {
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

  const form = document.getElementById("employee-form-container");
  const employeeListBody = document.getElementById("employee-list-body");
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

  saveToStorage();

  window.db.employees.forEach(em => {
     employeeListBody.innerHTML += `
       <tr>
              <td>${em.id}</td>
              <td>${em.email}</td>
              <td>${em.position}</td>
              <td>${em.department}</td>
              <td>${em.hireDate}</td>
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary px-2">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-warning text-dark px-2"
                    style="font-size: 0.75rem"
                  >
                    Reset Password
                  </button>
                  <button class="btn btn-sm btn-outline-danger px-2">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
  `
   })



  event.target.reset();

}

function handleDeptSubmit(event){
  event.preventDefault();

  const form = document.getElementById("department-form");
  const deptListBody = document.getElementById("dept-list-body");
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

   saveToStorage();

  window.db.departments.forEach(d => {
     deptListBody.innerHTML += `
       <tr>
              <td>${d.deptName}</td>
              <td class="text-secondary">${d.deptDesc}</td>   
              <td>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-outline-primary px-2">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger px-2">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
  `
  })

  event.target.reset();
}

function handleAccountSubmit(event){
  event.preventDefault();
  
  const accountListBody = document.getElementById("account-list-body");
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
  renderAccounts()

  event.target.reset();
}

function handleLogout(){
  localStorage.removeItem("auth_token");
  currentUser = null;
  setAuthState(false, currentUser);
  navigateTo("")
}
function renderAccounts() {
  const tbody = document.getElementById("account-list-body");
  if (!tbody) return; 
  
  tbody.innerHTML = ""; 

  if (window.db.accounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No accounts found.</td></tr>`;
    return; 
  }
  
  window.db.accounts.forEach(ac => {
    const lName = ac.lastName || ac.lastname || ''; 
    tbody.innerHTML += `
      <tr>
        <td>${ac.firstName} ${lName}</td>
        <td>${ac.email}</td>
        <td>${ac.role}</td>
        <td><span class="${ac.verified ? 'text-success' : 'text-danger'}">${ac.verified ? "✅" : "❌"}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary px-2">Edit</button>
            <button class="btn btn-sm btn-outline-danger px-2">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}
function renderEmployees() {
  const tbody = document.getElementById("employee-list-body");
  if (!tbody) return;
  
  tbody.innerHTML = ""; 
  
  if (window.db.employees.length === 0) {
     tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No employees found.</td></tr>`;
     return;
  }

  window.db.employees.forEach(em => {
    tbody.innerHTML += `
      <tr>
        <td>${em.id}</td>
        <td>${em.email}</td>
        <td>${em.position}</td>
        <td>${em.department}</td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary px-2">Edit</button>
            <button class="btn btn-sm btn-outline-danger px-2">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}
function renderDepartments() {
  const tbody = document.getElementById("dept-list-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";

  if (window.db.departments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-secondary">No departments found.</td></tr>`;
    return;
  }
  
  window.db.departments.forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td>${d.deptName}</td>
        <td class="text-secondary">${d.deptDesc}</td>   
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary px-2">Edit</button>
            <button class="btn btn-sm btn-outline-danger px-2">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);

loadFromStorage()