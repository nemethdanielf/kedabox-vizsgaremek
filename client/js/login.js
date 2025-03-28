const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    alert("Kérlek, töltsd ki az összes mezőt!");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // 💾 Token és adatok mentése
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      alert("✅ Sikeres bejelentkezés!");

      // 🔁 Átirányítás jogosultság alapján
      if (data.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      alert(data.message || "❌ Hibás felhasználónév vagy jelszó.");
    }
  } catch (error) {
    console.error(error);
    alert("❌ Hiba történt a szerverrel való kommunikáció közben.");
  }
});
