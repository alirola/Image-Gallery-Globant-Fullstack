const clientId = 'xqUunjlbw48Qr8Aqt1Qf2UiugPkcQQnUBOcH5RE9jYE'; // Reemplaza con tu Access Key
const redirectUri = 'http://localhost:3000'; // Asegúrate de que coincida con tu URL de redirección
const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

document.getElementById('login-Btn').addEventListener('click', () => {
    window.location.href = authUrl;
});

window.addEventListener('load', async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        await fetchUserInfo(token); // Si hay un token, obtén la info del usuario
        updateUIForLoggedInUser(); // Actualiza la interfaz para el usuario autenticado
    }

    if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            const response = await fetch('/getAccessToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data); // Verifica la respuesta aquí

            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                await fetchUserInfo(data.access_token);
                console.log('Token almacenado:', data.access_token); // Verifica que el token se almacene
                window.location.href = '/'; // Redirige a la página principal después de obtener el token
            } else {
                console.error('Error obteniendo el token:', data);
            }
        }
    }
});

async function fetchUserInfo(token) {
    const response = await fetch('https://api.unsplash.com/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching user info:', response.statusText);
        return;
    }

    const userData = await response.json();
    displayUserName(userData); // Muestra el nombre del usuario
}

function displayUserName(userData) {
    const userNameElement = document.getElementById('userName');
    userNameElement.textContent = `Hola, ${userData.name}!`; // Muestra el nombre del usuario
    userNameElement.style.display = 'block'; // Asegúrate de mostrar el nombre
}

function updateUIForLoggedInUser() {
    document.getElementById('login-Btn').style.display = 'none'; // Oculta el botón de login
    document.getElementById('logout-Btn').style.display = 'block'; // Asegúrate de mostrar el botón de logout
}

async function fetchPhotos(query) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        console.error('Token no disponible');
        return;
    }

    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching photos:', response.statusText, errorData);
        return;
    }

    const data = await response.json();
    displayPhotos(data.results);
}

document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-box').value;
    fetchPhotos(query);
});

function displayPhotos(photos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpia la galería antes de agregar nuevas fotos

    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description;
        gallery.appendChild(img);
    });
}

document.getElementById('logout-Btn').addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    alert('Has cerrado sesión.');
    window.location.reload(); // Recarga la página para actualizar la vista
});