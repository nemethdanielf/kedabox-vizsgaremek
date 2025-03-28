const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('regUsername').value;
  const fullname = document.getElementById('regFullname').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  if (password !== confirm) {
    return alert('A két jelszó nem egyezik!');
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullname, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Sikeres regisztráció!');
      window.location.href = 'signin.html';
    } else {
      alert(data.message || '❌ Hiba történt!');
    }
  } catch (err) {
    console.error(err);
    alert('❌ Hiba történt a kérés során!');
  }
});
