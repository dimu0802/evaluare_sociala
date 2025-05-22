document.addEventListener("DOMContentLoaded", async () => {
    const domainSelect = document.getElementById("domain");
  
    // încarcă domeniile
    const res = await fetch("http://localhost:3001/api/domains");
    const domains = await res.json();
    domains.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      domainSelect.appendChild(opt);
    });
  
    // trimite firma
    document.getElementById("companyForm").addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("name").value.trim();
      const domain = document.getElementById("domain").value;
      const description = document.getElementById("description").value.trim();
      const user_id = parseInt(localStorage.getItem("user_id"));
  
      const response = await fetch("http://localhost:3001/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, description, user_id })
      });
  
      const resultMsg = document.getElementById("resultMsg");
  
      if (response.ok) {
        const data = await response.json();
        resultMsg.textContent = `Firmă adăugată cu ID ${data.company_id}`;
        resultMsg.style.color = "green";
        document.getElementById("companyForm").reset();
      } else {
        resultMsg.textContent = "Eroare la adăugare firmă.";
        resultMsg.style.color = "red";
      }
    });
  });
  