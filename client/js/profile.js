window.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
  
    const usernameSpan = document.getElementById('profileUsername');
    const adminPanelContainer = document.getElementById('adminPanelContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const form = document.getElementById('changePasswordForm');
  
    // Ha nincs bejelentkezve, vissza főoldalra
    if (!token || !username || !role) {
      window.location.href = 'index.html';
      return;
    }
  
    // Kiírjuk a felhasználónevet
    if (usernameSpan) {
      usernameSpan.textContent = username;
    }
  
    // Admin panel gomb mutatása
    if (role === 'admin' && adminPanelContainer) {
      adminPanelContainer.style.display = 'block';
    }
  
    // Kijelentkezés gomb működés
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = 'index.html';
      });
    }
  
    // Jelszócsere logika
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;
  
        if (newPassword !== confirm) {
          return alert('Az új jelszavak nem egyeznek!');
        }
  
        try {
          const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert('✅ Sikeres jelszócsere! Jelentkezz be újra.');
            localStorage.clear();
            window.location.href = 'signin.html';
          } else {
            alert(data.message || '❌ Hibás régi jelszó.');
          }
        } catch (err) {
          console.error(err);
          alert('❌ Szerverhiba.');
        }
      });
    }
  });
  