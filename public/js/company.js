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
  
  function getCompanyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }
  
  async function loadCompanyDetails(id) {
    try {
      const response = await fetch(`http://localhost:3001/api/companies/${id}`);
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
    const reviewContainer = document.getElementById("reviewList");
  
    try {
      const response = await fetch(`http://localhost:3001/api/companies/${id}/reviews`);
      const reviews = await response.json();
  
      // Afișează media ratingului
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = (total / reviews.length).toFixed(2);
        document.getElementById("companyAverage").textContent = `${average} / 5`;
      } else {
        document.getElementById("companyAverage").textContent = "Fără review-uri momentan.";
      }
  
      // Afișează lista review-urilor
      if (reviews.length === 0) {
        reviewContainer.innerHTML = "<p><i>Momentan nu sunt review-uri.</i></p>";
        return;
      }

      reviewContainer.innerHTML = "";
      reviews.forEach(r => {
        const div = document.createElement("div");
        div.classList.add("review-box");
        div.innerHTML = `
            <strong>${r.username}</strong> a dat nota <strong>${r.rating}</strong> firmei:
            <em>"${r.comment}"</em>
        `;
        reviewContainer.appendChild(div);

      });
    } catch (err) {
      console.error("Eroare la încărcarea review-urilor:", err);
      reviewContainer.innerHTML = "<p><i>Eroare la încărcare review-uri.</i></p>";
    }
  }

  function renderReviewForm(companyId) {
    const container = document.getElementById("reviewFormContainer");
    const userId = localStorage.getItem("user_id");
  
    if (!userId) {
      container.innerHTML = `
        <div class="not-logged-box">
          <p>
            🔒 Trebuie să fii <a href="login.html">autentificat</a> pentru a lăsa un review.
          </p>
        </div>
      `;
      return;
    }
  
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
      e.preventDefault();
      const rating = parseInt(document.getElementById("rating").value);
      const comment = document.getElementById("comment").value.trim();
  
      if (!rating || !comment) return;
  
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
  
  document.getElementById("aiFeedbackBtn").addEventListener("click", async () => {
    const companyId = getCompanyIdFromUrl();
    const resultDiv = document.getElementById("aiFeedbackResult");
  
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "<em>Analizăm review-urile, te rugăm așteaptă...</em>";
  
    try {
      const res = await fetch(`http://localhost:3001/api/ai-feedback/${companyId}`, {
        method: "POST"
      });
  
      if (!res.ok) throw new Error("Cererea a eșuat");
  
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
  