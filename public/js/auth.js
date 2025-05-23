document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");
    if (!form) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // previne reincarc paginii
  
      //ia valorile din formular
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const message = document.getElementById("loginMessage");
  
      try { //trimite cerere post catre api/login
        const response = await fetch("http://localhost:3001/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
  
        if (!response.ok) {
          message.textContent = "Date de autentificare invalide.";
          return;
        }
  
        //daca login reuseste, salveaza datele in localStorage
        const data = await response.json();
        localStorage.setItem("user_id", data.id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("is_owner", data.is_owner);
        window.location.href = "index.html"; //redirectioneaza user spre main page
      } catch (err) {
        console.error("Eroare la logare:", err);
        message.textContent = "Eroare la conectare.";
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm"); //gaseste formularul de inscriere
    if (!form) return;
  
    //obtine toate valorile din formular
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const gender = document.getElementById("gender").value;
      const is_owner = document.getElementById("isOwner").checked;
  
      const message = document.getElementById("registerMessage"); //
  
      //trimite cerere post la backend cu toate datele
      try {
        const res = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, gender, is_owner })

        });
  
        if (!res.ok) {
          message.textContent = "Înregistrarea a eșuat.";
          return;
        }
  
        //salveaza user ul in localstorage si il redirectioneaza la homepage
        const data = await res.json();
        localStorage.setItem("user_id", data.id);
        localStorage.setItem("username", username);
        window.location.href = "index.html";
      } catch (err) {
        console.error("Eroare la înregistrare:", err);
        message.textContent = "Eroare la conectare.";
      }
    });
  });