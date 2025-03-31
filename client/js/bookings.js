document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    const token = localStorage.getItem('token');
  
    if (!form) return;
  
    if (!token) {
      form.innerHTML = '<p class="text-danger">Jelentkezz be a foglaláshoz!</p>';
      return;
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const training_type = document.getElementById('training_type').value;
      const training_date = document.getElementById('training_date').value;
      const training_time = document.getElementById('training_time').value;
  
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ training_type, training_date, training_time })
        });
  
        const result = await res.json();
  
        if (res.ok) {
          alert('✅ Edzés sikeresen lefoglalva!');
          form.reset();
        } else {
          alert(result.message || '❌ Hiba történt.');
        }
      } catch (err) {
        console.error(err);
        alert('❌ Hálózati hiba.');
      }
    });
  });
  