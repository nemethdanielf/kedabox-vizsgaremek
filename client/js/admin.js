window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    alert('❌ Nincs jogosultságod!');
    return window.location.href = 'index.html';
  }

  try {
    const res = await fetch('/api/callback', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      return alert(error.message || 'Nem sikerült lekérni az adatokat.');
    }

    const data = await res.json();
    console.log('Beérkezett visszahívások:', data);

    const tableBody = document.querySelector('#callbackTable tbody');
    tableBody.innerHTML = '';

    data.forEach(req => {
      const tr = document.createElement('tr');
      tr.dataset.id = req.id;

      tr.innerHTML = `
        <td>${req.name}</td>
        <td>${req.phone}</td>
        <td>${req.message || '-'}</td>
        <td>${new Date(req.created_at).toLocaleString('hu-HU')}</td>
        <td>
          <select class="status-select">
            <option value="pending" ${req.status === 'pending' ? 'selected' : ''}>⏳ Függőben</option>
            <option value="done" ${req.status === 'done' ? 'selected' : ''}>✅ Megoldva</option>
          </select>
        </td>
        <td>
          <button class="delete-btn" style="color: red;">❌</button>
        </td>
      `;

      // Státusz módosítás
      const select = tr.querySelector('.status-select');
      select.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        const id = tr.dataset.id;

        const res = await fetch(`/api/callback/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        const result = await res.json();
        if (res.ok) {
          alert('✅ Státusz frissítve');
        } else {
          alert(result.message || '❌ Hiba történt');
        }
      });

      // Törlés
      const deleteBtn = tr.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Biztosan törölni szeretnéd ezt a bejegyzést?')) {
          const res = await fetch(`/api/callback/${req.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const result = await res.json();

          if (res.ok) {
            alert('🗑️ Sikeresen törölve!');
            tr.remove();
          } else {
            alert(result.message || '❌ Hiba történt a törlés során');
          }
        }
      });

      tableBody.appendChild(tr);
    });

    // ✅ CSV EXPORT gomb működése
    const exportBtn = document.getElementById('exportCSV');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          const exportRes = await fetch('/api/callback', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!exportRes.ok) {
            const err = await exportRes.json();
            return alert(err.message || '❌ Nem sikerült lekérni az adatokat.');
          }

          const exportData = await exportRes.json();

          if (!exportData.length) {
            return alert('❗ Nincs exportálható adat.');
          }

          const header = ['Név', 'Telefonszám', 'Üzenet', 'Dátum', 'Státusz'];
          const rows = exportData.map(d => [
            `"${d.name}"`,
            `"${d.phone}"`,
            `"${d.message || ''}"`,
            `"${new Date(d.created_at).toLocaleString('hu-HU')}"`,
            `"${d.status}"`
          ]);

          const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = 'visszahivasok.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

        } catch (err) {
          console.error('Export hiba:', err);
          alert('❌ Hiba történt az exportálás során.');
        }
      });
    }

  } catch (err) {
    console.error('Hiba:', err);
    alert('❌ Nem sikerült lekérni az adatokat.');
  }
});
