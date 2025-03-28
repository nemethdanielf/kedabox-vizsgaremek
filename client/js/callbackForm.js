document.getElementById('callbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      message: formData.get('message')
    };

    const res = await fetch('/api/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message);
    if (res.ok) e.target.reset();
  });