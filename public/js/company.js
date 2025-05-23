document.addEventListener("DOMContentLoaded", async () => {
    const companyId = getCompanyIdFromUrl(); 
    if (!companyId) {
      alert("ID companie lipsă din URL");
      return;
    }

    await loadCompanyDetails(companyId);
    await renderReviewForm(companyId);
    await loadCompanyReviews(companyId);
  });
  
  function getCompanyIdFromUrl() { //cauta id in url
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }
  
  async function loadCompanyDetails(id) {
    try {
      const response = await fetch(`http://localhost:3001/api/companies/${id}`); //trimite cerere get la backend
      const company = await response.json();
  
      document.getElementById("companyName").textContent = company.name;
      document.getElementById("companyDomain").textContent = company.domain;
      document.getElementById("companyDescription").textContent = company.description;
    } catch (err) {
      console.error("Eroare la încărcarea companiei:", err);
      alert("Nu s-au putut încărca datele companiei.");
    }
  }
  
  async function loadCompanyReviews(id) {
    const reviewContainer = document.getElementById("reviewList"); // gaseste te divul din pagina unde vor fi afisate reviews
  
    try {
      const response = await fetch(`http://localhost:3001/api/companies/${id}/reviews`); // cere lista de reviews a companiei
      const reviews = await response.json(); //transforma rasp in json
  
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0); //face suma reviewurilor
        const average = (total / reviews.length).toFixed(2); // face media si rotunjeste la 2
        document.getElementById("companyAverage").textContent = `${average} / 5`; //afiseaza
      } else {
        document.getElementById("companyAverage").textContent = "Fără review-uri momentan.";
      }
  
      if (reviews.length === 0) { //ce afiseaza daca nu exista review uri
        reviewContainer.innerHTML = "<p><i>Momentan nu sunt review-uri.</i></p>";
        return;
      }

      reviewContainer.innerHTML = "";
      reviews.forEach(r => { //pt fiecare review creeaza un div cu clasa review-box
        const div = document.createElement("div");
        div.classList.add("review-box");
        div.innerHTML = `
            <strong>${r.username}</strong> a dat nota <strong>${r.rating}</strong> firmei:
            <em>"${r.comment}"</em>
        `;
        reviewContainer.appendChild(div); //adauga div-ul in DOM

      });
    } catch (err) {
      console.error("Eroare la încărcarea review-urilor:", err);
      reviewContainer.innerHTML = "<p><i>Eroare la încărcare review-uri.</i></p>";
    }
  }

  function renderReviewForm(companyId) {
    const container = document.getElementById("reviewFormContainer"); // cauta in DOM containerul in care se va pune fie formularul de review, daca esti logat, fie un mesaj sa te loghezi
    const userId = localStorage.getItem("user_id");
  
    if (!userId) { //afiseaza mesaj daca user nu e logat
      container.innerHTML = `
        <div class="not-logged-box">
          <p>
            Trebuie să fii <a href="login.html">autentificat</a> pentru a lăsa un review.
          </p>
        </div>
      `;
      return;
    }
  
    //meniu dropdown ot nota + camp de comentariu + buton trimitere
    container.innerHTML = `
      <form id="reviewForm" class="review-form">
        <label for="rating">Nota (1–5):</label>
        <select id="rating" required>
          <option value="">Alege...</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select><br><br>
  
        <label for="comment">Comentariu:</label><br>
        <textarea id="comment" rows="4" required></textarea><br><br>
  
        <button type="submit">Trimite review</button>
      </form>
    `;
  

    document.getElementById("reviewForm").addEventListener("submit", async (e) => {
      e.preventDefault(); //previne comportament drfault (ii spui: "nu trimite tu in stil clasic") stil clasic-se schimba pagina sau se reincarca

      //obtine nota si comentariul
      const rating = parseInt(document.getElementById("rating").value);
      const comment = document.getElementById("comment").value.trim();
  
      if (!rating || !comment) return;
  
      //trimite datele catre backend
      try {
        const res = await fetch("http://localhost:3001/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: parseInt(userId),
            company_id: parseInt(companyId),
            rating,
            comment
          })
        });
  
        //mesaje de afisare daca s a trimis
        if (res.ok) {
          alert("Review adăugat cu succes!");
          await loadCompanyReviews(companyId);
          document.getElementById("reviewForm").reset();
        } else {
          alert("Eroare la trimiterea review-ului.");
        }
      } catch (err) {
        console.error("Eroare la trimitere review:", err);
      }
    });
  }
  
  //cand utilizatorul apasa butonul, se executa fct de mai jos
  document.getElementById("aiFeedbackBtn").addEventListener("click", async () => {
    //obtine compania si locul unde se va afisa review ul
    const companyId = getCompanyIdFromUrl();
    const resultDiv = document.getElementById("aiFeedbackResult");
  
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<em>Analizăm review-urile, te rugăm așteaptă...</em>";
  
    //trimite cerere catre backend
    try {
      const res = await fetch(`http://localhost:3001/api/ai-feedback/${companyId}`, {
        method: "POST"
      });
  
      if (!res.ok) throw new Error("Cererea a eșuat");
  
      //extrage si afiseaza sugestia aix
      const data = await res.json();
      resultDiv.innerHTML = `
        <h3>Sugestii AI pentru îmbunătățire</h3>
        <p>${data.feedback}</p>
      `;
    } catch (err) {
      console.error("Eroare la generarea feedback-ului:", err);
      resultDiv.innerHTML = "<p style='color: red;'>Nu s-a putut obține sugestia.</p>";
    }
  });
  