const STORAGE_KEY = "ipt_demo_v1";
let currentUser = null;
const routes = {
  "/accounts": renderAccounts,
  "/employees": renderEmployees,
  "/departments": renderDepartments,
  "/requests": renderRequests
};

function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
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
          deptDesc: "Software Team",
        },
        {
          deptName: "HR",
          deptDesc: "Human Resources",
        },
      ],
      employees: [],
      requests: []
    };

    saveToStorage();
  }

  const savedToken = localStorage.getItem("auth_token");
  if (savedToken) {
    const activeUser = window.db.accounts.find((ac) => ac.email === savedToken);

    if (activeUser) {
      currentUser = activeUser;
      console.log(currentUser);
      setAuthState(true, currentUser);
    }
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
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
    showToast("Access denied! Admins only.", "danger");
    return navigateTo("#/profile");
  }
  
  targetPage.classList.add("active");

  if (cleanHash === "#login") {
    const loginAlert = document.getElementById("login-verified-alert");
    
    if (sessionStorage.getItem("just_verified") === "true") {
      loginAlert.classList.remove("d-none"); 
      sessionStorage.removeItem("just_verified"); 
    } else {
      loginAlert.classList.add("d-none"); 
    }
  }

  let routeKey = cleanHash.replace("#", "/");

  if (routes[routeKey]) {
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
    showToast("Password must be at least 6 characters long!", "warning");
    return;
  }

  const doesEmailExist = window.db.accounts.some((ac) => ac.email === email);

  if (doesEmailExist) {
    showToast("This email is already registered!", "danger");
    return;
  }

  const registeredAccount = {
    firstName,
    lastName,
    email,
    password,
    role: "User",
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

  if (targetAccount) {
    targetAccount.verified = true;

    localStorage.setItem("accounts_db", JSON.stringify(window.db.accounts));
    localStorage.removeItem("unverified_email");
    
    sessionStorage.setItem("just_verified", "true");
    
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
    showToast("Invalid credentials or unverified email!", "danger");
  }
}

function setAuthState(isAuth, user) {
  if (isAuth) {
    document.body.classList.remove("not-authenticated");
    document.body.classList.add("authenticated");
    
    const navUsername = document.getElementById("nav-username");
    if (navUsername) {
      navUsername.innerText = user.firstName;
    }

    if (user.role.toLowerCase() === "admin") {
      document.body.classList.add("is-admin");
    }
  } else {
    document.body.classList.remove("authenticated");
    document.body.classList.remove("is-admin");
    document.body.classList.add("not-authenticated");
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


    populateDepartmentDropdown();
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

function handleEmployeeSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("employee-form-container");
  const employeeListBody = document.getElementById("employee-list-body");
  const employeeId = document.getElementById("emp-id").value;
  const employeeEmail = document.getElementById("emp-email").value;
  const employeePosition = document.getElementById("emp-position").value;
  const employeeDepartment = document.getElementById("emp-dept").value;
  const employeeHiredDate = document.getElementById("emp-hire-date").value;

  if (
    !employeeId ||
    !employeeEmail ||
    !employeePosition ||
    !employeeDepartment ||
    !employeeHiredDate
  ) {
    showToast("Please fill out all employee fields!", "warning");
    return;
  }

  const doesIdExist = window.db.employees.some((ac) => ac.id === employeeId);

  if (doesIdExist) {
   showToast("This Employee ID already exists!", "danger");
    return;
  }

  const insertEmployee = {
    id: employeeId,
    email: employeeEmail,
    position: employeePosition,
    department: employeeDepartment,
    hireDate: employeeHiredDate,
  };

  window.db.employees.push(insertEmployee);
  saveToStorage();
  renderEmployees();

  event.target.reset();
}

function handleDeptSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("department-form");
  const departmentName = document.getElementById("dept-name").value.trim();
  const departmentDescription = document
    .getElementById("dept-desc")
    .value.trim();

  if (!departmentName || !departmentDescription) {
    showToast("Please fill out all department fields!", "warning");
    return;
  }

  const insertDepartment = {
    deptName: departmentName,
    deptDesc: departmentDescription,
  };

  window.db.departments.push(insertDepartment);
  saveToStorage();
  renderDepartments();

  event.target.reset();
}

function handleAccountSubmit(event) {
  event.preventDefault();

  const firstName = document.getElementById("acc-first-name").value;
  const lastName = document.getElementById("acc-last-name").value;
  const email = document.getElementById("acc-email").value;
  const password = document.getElementById("acc-password").value;
  const role = document.getElementById("acc-role").value;
  const verified = document.getElementById("acc-verified").checked;

  if (!firstName || !lastName || !email || !password) {
    showToast("Please fill out all account fields!", "warning");
    return;
  }

  const insertAccount = {
    firstName,
    lastName,
    email,
    password,
    role,
    verified,
  };

  const doesEmailExist = window.db.accounts.some((ac) => ac.email === email);

  if (doesEmailExist) {
    showToast("This email is already registered!", "danger");
    return;
  }

  if (!verified) {
    localStorage.setItem("unverified_email", email);
  }

  window.db.accounts.push(insertAccount);
  saveToStorage();
  renderAccounts();

  event.target.reset();
}

function handleLogout() {
  localStorage.removeItem("auth_token");
  currentUser = null;
  setAuthState(false, currentUser);
  navigateTo("");
}

function submitRequest() {
  const itemList = document.getElementById("modal-item-list");
  const rows = itemList.querySelectorAll(".d-flex");

  const items = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const itemName = inputs[0].value.trim();
    const quantity = parseInt(inputs[1].value, 10);

    if (itemName && quantity > 0) {
      items.push({ name: itemName, quantity: quantity });
    }
  });

  if (items.length === 0) {
    showToast("Please add at least one valid item.", "warning");
    return;
  }

  const newRequest = {
    id: "REQ-" + Math.floor(1000 + Math.random() * 9000), 
    userEmail: currentUser ? currentUser.email : "Unknown",
    date: new Date().toISOString().split("T")[0], 
    type: "Equipment",
    status: "Pending",
    items: items
  };

  window.db.requests.push(newRequest);
  saveToStorage();

  const modalElement = document.getElementById("requestModal");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();

  document.getElementById("newRequestForm").reset();
  itemList.innerHTML = `
    <div class="d-flex gap-2 mb-2 align-items-center">
      <input type="text" class="form-control" placeholder="Item name" />
      <input type="number" class="form-control w-25" value="1" />
      <button type="button" class="btn btn-outline-secondary px-2" onclick="addRow()">
        +
      </button>
    </div>
  `;

  renderRequests();
}
function renderAccounts() {
  const tbody = document.getElementById("account-list-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (window.db.accounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No accounts found.</td></tr>`;
    return;
  }

  window.db.accounts.forEach((ac, index) => {
    const lName = ac.lastName || ac.lastname || "";
    tbody.innerHTML += `
      <tr>
        <td>${ac.firstName} ${lName}</td>
        <td>${ac.email}</td>
        <td>${ac.role}</td>
        <td><span class="${ac.verified ? "text-success" : "text-danger"}">${ac.verified ? "✅" : "❌"}</span></td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary px-2" onClick="editItem('accounts', ${index})">Edit</button>
            <button class="btn btn-sm btn-outline-danger px-2" onClick="confirmDelete('accounts', ${index})">Delete</button>
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

  window.db.employees.forEach((em, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${em.id}</td>
        <td>${em.email}</td>
        <td>${em.position}</td>
        <td>${em.department}</td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" onclick="editItem('employees', ${index})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('employees', ${index})">Delete</button>
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

  window.db.departments.forEach((d, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${d.deptName}</td>
        <td class="text-secondary">${d.deptDesc}</td>   
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary px-2" onclick="editItem('departments', ${index})">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('departments', ${index})">Delete</button>          </div>
        </td>
      </tr>
    `;
  });
}

function renderRequests() {
  const emptyState = document.getElementById("requests-empty");
  const tableContainer = document.getElementById("requests-table-container");
  const tbody = document.getElementById("request-list-body");

  if (!tbody) return;

  let requestsToRender = [];
  const isAdmin = currentUser && currentUser.role.toLowerCase() === "admin";

  if (isAdmin) {
    requestsToRender = window.db.requests;
    document.querySelector("#requests h2").innerText = "All Requests"; 
  } else {
    requestsToRender = window.db.requests.filter(req => req.userEmail === currentUser.email);
    document.querySelector("#requests h2").innerText = "My Requests";
  }

  if (requestsToRender.length === 0) {
    emptyState.classList.remove("d-none");
    tableContainer.classList.add("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  tableContainer.classList.remove("d-none");
  tbody.innerHTML = "";

  requestsToRender.forEach((req) => {
    const itemsHTML = req.items.map(item => `&bull; ${item.quantity}x ${item.name}`).join('<br>');
    
    let badgeClass = "bg-warning text-dark"; 
    if (req.status === "Approved") badgeClass = "bg-success";
    if (req.status === "Rejected") badgeClass = "bg-danger";

    let actionButtons = "";
    
    if (isAdmin) {
      if (req.status === "Pending") {
        actionButtons += `<button class="btn btn-sm btn-outline-success px-2 me-1" onclick="updateRequestStatus('${req.id}', 'Approved')">Approve</button>`;
        actionButtons += `<button class="btn btn-sm btn-outline-danger px-2" onclick="updateRequestStatus('${req.id}', 'Rejected')">Reject</button>`;
      } else {
        actionButtons += `<span class="text-secondary small">Processed</span>`;
      }
    } else {
      if (req.status === "Pending") {
        const realIndex = window.db.requests.findIndex(r => r.id === req.id);
        actionButtons += `<button class="btn btn-sm btn-outline-danger px-2" onclick="confirmDelete('requests', ${realIndex})">Delete</button>`;
      } else {
        actionButtons += `<span class="text-secondary small">Locked</span>`;
      }
    }

    tbody.innerHTML += `
      <tr>
        <td><strong>${req.id}</strong></td>
        <td class="text-secondary">${req.date}</td>
        <td>${req.userEmail}</td>
        <td><small>${itemsHTML}</small></td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
        <td>
          <div class="d-flex align-items-center">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  });
}

function updateRequestStatus(requestId, newStatus) {
  const requestToUpdate = window.db.requests.find(req => req.id === requestId);
  
  if (requestToUpdate) {
    requestToUpdate.status = newStatus;
    
    saveToStorage();
    
    renderRequests();
  }
}
let deleteTarget = { type: null, index: null };

function confirmDelete(type, index) {
  deleteTarget = { type, index };
  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal"),
  );
  modal.show();
}

function executeDelete() {
  const { type, index } = deleteTarget;

  window.db[type].splice(index, 1);
  saveToStorage();

  if (type === "employees") renderEmployees();
  if (type === "accounts") renderAccounts();
  if (type === "departments") renderDepartments();

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("deleteConfirmModal"),
  );
  modal.hide();
}
function editItem(type, index) {
  const item = window.db[type][index];

  if (type === "employees") {
    toggleEmployeeForm(); // Show form
    document.getElementById("emp-id").value = item.id;
    document.getElementById("emp-email").value = item.email;
    document.getElementById("emp-position").value = item.position;
    document.getElementById("emp-dept").value = item.department;
    document.getElementById("emp-hire-date").value = item.hireDate;
  } else if (type === "departments") {
    toggleDeptForm();
    document.getElementById("dept-name").value = item.deptName;
    document.getElementById("dept-desc").value = item.deptDesc;
  } else if (type === "accounts") {
    toggleAccountForm();
    document.getElementById("acc-first-name").value = item.firstName;
    document.getElementById("acc-last-name").value = item.lastName;
    document.getElementById("acc-email").value = item.email;
    document.getElementById("acc-password").value = item.password;
    document.getElementById("acc-role").value = item.role;
    document.getElementById("acc-verified").checked = item.verified;
  }
}

function populateDepartmentDropdown() {
  const deptSelect = document.getElementById("emp-dept");
  if (!deptSelect) return;

  deptSelect.innerHTML = `<option value="" disabled selected>Select a department...</option>`;

  window.db.departments.forEach(dept =>
    deptSelect.innerHTML += `<option value="${dept.deptName}">${dept.deptName}</option>`
  )

}

function showToast(message, type = "danger") {
  const toastEl = document.getElementById("appToast");
  const toastMessage = document.getElementById("toastMessage");

  toastEl.className = `toast align-items-center border-0 bg-${type}`;
  
  toastMessage.innerText = message;

  const toastInstance = new bootstrap.Toast(toastEl);
  toastInstance.show();
}
window.addEventListener("hashchange", handleRouting);
window.addEventListener("load", handleRouting);

loadFromStorage();
