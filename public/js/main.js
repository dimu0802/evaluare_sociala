document.addEventListener("DOMContentLoaded", async () => {
    await loadDomains(); //incarca valorile enum 
    await loadCompanies() 
  });
  
  async function loadDomains() {
    const select = document.getElementById("filterDomain"); //cauta elementul filterdomain
    if (!select) return;
  
    try { //incarca domeniile firmelor
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
  
    try { //creeaza un url care permite adaugarea de parametri get
      const url = new URL("http://localhost:3001/api/companies");
      if (name) url.searchParams.append("name", name);
      if (domain) url.searchParams.append("domain", domain);
  
      //trimite request catre backend
      const response = await fetch(url);
      const companies = await response.json();
  
      if (companies.length === 0) {
        companyList.innerHTML = "<p><i>Nu am găsit nicio companie.</i></p>";
        return;
      }
  
      companyList.innerHTML = ""; //goleste lista de companii
      companies.forEach(company => {
        const p = document.createElement("p");
        p.textContent = `${company.name} — ${company.domain}`;
        p.onclick = () => {
          window.location.href = `company.html?id=${company.id}`; //daca user da click, il redirectioneaza pe acea comp
        };
        companyList.appendChild(p);
      });
  
    } catch (err) {
      console.error("Eroare la încărcarea companiilor:", err);
      companyList.innerHTML = "<p><i>Eroare la încărcare companii.</i></p>";
    }
  }
  
  //cauta companii
  function searchCompanies() {
    const name = document.getElementById("searchInput").value.trim(); //cauta numele comp in baza de date
    const domainSelect = document.getElementById("filterDomain");
    const domain = domainSelect && domainSelect.value !== "Eroare la încărcare"
        ? domainSelect.value
        : "";

    loadCompanies(name, domain); //apeleaza fct loadCompanies cu parametrii dati
  }

  //afiseaza starea de autentificare
  document.addEventListener("DOMContentLoaded", () => {
    const statusSpan = document.getElementById("loginStatus"); //locul unde se afiseaza mesajul "esti logat ca"
    const logoutBtn = document.getElementById("logoutBtn"); //buton de logout, initial ascuns
  
    const username = localStorage.getItem("username"); //verfifica daca exista user, daca da, e autentificat
  
    if (username) {
      statusSpan.textContent = `Ești logat ca: ${username}`; //afiseaza nume user
      // statusSpan.style.color = "#2ecc71";
      logoutBtn.style.display = "inline-block";
  
      logoutBtn.addEventListener("click", () => { //daca da click pe buton logout, se sterg datele din localstorage
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        window.location.href = "index.html";
      });
    }
  });

  
  document.addEventListener("DOMContentLoaded", () => { //functie care afiseaza dinamic butonul adauga firma
    const isOwner = localStorage.getItem("is_owner") === "true";
    const isLoggedIn = localStorage.getItem("user_id") !== null;
    //verifica daca cel logat e owner si daca e logat

    if (isLoggedIn && isOwner) {
      const container = document.getElementById("addCompanyWrapper"); //cauta elem gol din html
      if (!container) return; //daca nu exista, se iese din functie
  
      const btn = document.createElement("button");
      btn.textContent = "➕ Adaugă companie";
      btn.style.padding = "12px 24px";
      btn.style.backgroundColor = "#2ecc71";
      btn.style.color = "white";
      btn.style.border = "none";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "16px";
  
      btn.onclick = () => window.location.href = "add-company.html";
      container.appendChild(btn);
      //adauga butonul in contariner ul gasit anterior, ca sa apara doar cand esti logat si owner
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const navArea = document.getElementById("navArea"); //cauta in html containerul navarea
    if (!navArea) return; //daca nu l gaseste se opreste
  
    const username = localStorage.getItem("username"); 
  
    if (username) {
      // eveniment pe buton logout
      document.getElementById("logoutBtn").addEventListener("click", () => { //daca da click pe logout, 
        localStorage.clear(); //se goleste localstorage
        window.location.reload(); // refresh pentru a curăța UI-ul
      });
    } else { //daca nu e logat afiseaza butoanele de login/signup
      navArea.innerHTML = `
        <a href="login.html">Log In</a>
        <a href="register.html">Sign Up</a>
      `;
    }
  });