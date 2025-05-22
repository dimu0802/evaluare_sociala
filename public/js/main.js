document.addEventListener("DOMContentLoaded", async () => {
    await loadDomains();
    await loadCompanies()
  });
  
  async function loadDomains() {
    const select = document.getElementById("filterDomain");
    if (!select) return;
  
    try {
      const response = await fetch("http://localhost:3001/api/domains");
      const domains = await response.json();
  
      select.innerHTML = `<option value="">Toate domeniile</option>`;
      domains.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Eroare la încărcarea domeniilor:", err);
      select.innerHTML = `<option value="">Toate domeniile</option>`;
    }
  }
  
  async function loadCompanies(name = "", domain = "") {
    const companyList = document.getElementById("companyList");
    companyList.innerHTML = "<p>Se încarcă...</p>";
  
    try {
      const url = new URL("http://localhost:3001/api/companies");
      if (name) url.searchParams.append("name", name);
      if (domain) url.searchParams.append("domain", domain);
  
      const response = await fetch(url);
      const companies = await response.json();
  
      if (companies.length === 0) {
        companyList.innerHTML = "<p><i>Nu am găsit nicio companie.</i></p>";
        return;
      }
  
      companyList.innerHTML = "";
      companies.forEach(company => {
        const p = document.createElement("p");
        p.textContent = `${company.name} — ${company.domain}`;
        p.onclick = () => {
          window.location.href = `company.html?id=${company.id}`;
        };
        companyList.appendChild(p);
      });
  
    } catch (err) {
      console.error("Eroare la încărcarea companiilor:", err);
      companyList.innerHTML = "<p><i>Eroare la încărcare companii.</i></p>";
    }
  }
  
  function searchCompanies() {
    const name = document.getElementById("searchInput").value.trim();
    const domainSelect = document.getElementById("filterDomain");
    const domain = domainSelect && domainSelect.value !== "Eroare la încărcare"
        ? domainSelect.value
        : "";

    loadCompanies(name, domain);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const statusSpan = document.getElementById("loginStatus");
    const logoutBtn = document.getElementById("logoutBtn");
  
    const username = localStorage.getItem("username");
  
    if (username) {
      statusSpan.textContent = `👤 Ești logat ca: ${username}`;
      statusSpan.style.color = "#2ecc71";
      logoutBtn.style.display = "inline-block";
  
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        window.location.href = "index.html";
      });
    }
    // } else {
    //   statusSpan.textContent = "🔓 Nu ești autentificat";
    //   statusSpan.style.color = "#e74c3c";
    // }
  });

  
  document.addEventListener("DOMContentLoaded", () => {
    const isOwner = localStorage.getItem("is_owner") === "true";
    const isLoggedIn = localStorage.getItem("user_id") !== null;
  
    if (isLoggedIn && isOwner) {
      const container = document.getElementById("addCompanyWrapper");
      if (!container) return;
  
      const btn = document.createElement("button");
      btn.textContent = "➕ Adaugă firmă";
      btn.style.padding = "12px 24px";
      btn.style.backgroundColor = "#2ecc71";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "16px";
  
      btn.onclick = () => window.location.href = "add-company.html";
      container.appendChild(btn);
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const navArea = document.getElementById("navArea");
    if (!navArea) return;
  
    const username = localStorage.getItem("username");
  
    if (username) {
      // eveniment pe buton logout
      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
        window.location.reload(); // refresh pentru a curăța UI-ul
      });
    } else {
    
      navArea.innerHTML = `
        <a href="login.html">Log In</a>
        <a href="register.html">Sign Up</a>
      `;
    }
  });