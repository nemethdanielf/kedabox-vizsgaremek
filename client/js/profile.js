window.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const usernameSpan = document.getElementById('profileUsername');
  const adminPanelContainer = document.getElementById('adminPanelContainer');
  const logoutBtn = document.getElementById('logoutBtn');
  const form = document.getElementById('changePasswordForm');
  const bookingsTable = document.querySelector('#bookingsTable tbody');

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
      localStorage.clear();
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

  // Foglalások betöltése
  if (bookingsTable) {
    fetch('/api/bookings/mine', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Foglalások válasza:', data);
        bookingsTable.innerHTML = '';

        if (data.length === 0) {
          bookingsTable.innerHTML = `<tr><td colspan="5" class="text-center">Nincs lefoglalt edzésed.</td></tr>`;
          return;
        }

        data.forEach(booking => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${booking.training_type}</td>
            <td>${new Date(booking.training_date).toLocaleDateString('hu-HU')}</td>
            <td>${booking.training_time.slice(0, 5)}</td>
            <td>${new Date(booking.created_at).toLocaleString('hu-HU')}</td>
            <td><button class="btn btn-sm btn-danger delete-booking" data-id=${booking.id}>❌</button></td>
          `;
          bookingsTable.appendChild(tr);
        });

        // Törlésgomb események
        document.querySelectorAll('.delete-booking').forEach(button => {
          button.addEventListener('click', async () => {
            const bookingId = button.dataset.id;
        
            if (!bookingId) {
              alert('❌ Hiba: nincs foglalás ID!');
              return;
            }
        
            if (confirm('Biztosan törölni szeretnéd ezt a foglalást?')) {
              const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
        
              const result = await res.json();
        
              if (res.ok) {
                alert('🗑️ A foglalás törölve lett.');
                button.closest('tr').remove();
              } else {
                alert(result.message || '❌ Hiba történt a törlés során.');
              }
            }
          });
        });        
      })
      .catch(err => {
        console.error('Hiba a foglalások lekérésekor:', err);
        bookingsTable.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Hiba történt a foglalások betöltésekor.</td></tr>`;
      });
  }
});
