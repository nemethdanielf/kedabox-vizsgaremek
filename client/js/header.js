// Ellenőrzés: be van-e jelentkezve?
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const role = localStorage.getItem('role');

const loginNavItem = document.getElementById('loginNavItem');
const userProfileNav = document.getElementById('userProfileNav');
const usernameDisplay = document.getElementById('usernameDisplay');

if (token && username && role) {
  // Mutassuk a "profil" linket
  if (userProfileNav) userProfileNav.style.display = 'block';
  if (usernameDisplay) usernameDisplay.textContent = username;

  // Tüntessük el a "Bejelentkezés" gombot
  if (loginNavItem) loginNavItem.style.display = 'none';
}
