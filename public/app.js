const clientId = 'xqUunjlbw48Qr8Aqt1Qf2UiugPkcQQnUBOcH5RE9jYE'; // Reemplaza con tu Access Key
const redirectUri = 'http://localhost:3000'; // Asegúrate de que coincida con tu URL de redirección
const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public+write_likes`;

document.getElementById('login-Btn').addEventListener('click', () => {
    window.location.href = authUrl;
});

window.addEventListener('load', async () => {
    const token = localStorage.getItem('accessToken');
    
    // Si no hay token, ocultar el botón de logout y mostrar el botón de login
    if (!token) {
        document.getElementById('logout-Btn').style.display = 'none';
        document.getElementById('login-Btn').style.display = 'block';
    } else {
        // Si hay un token, obtener la información del usuario
        await fetchUserInfo(token);
        updateUIForLoggedInUser(); // Actualiza la interfaz para el usuario autenticado
    }

    // Si hay un código de autorización en la URL, obtener el token de acceso
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
            console.log('Respuesta del servidor:', data);

            if (data.access_token) {
                localStorage.setItem('accessToken', data.access_token);
                await fetchUserInfo(data.access_token);
                console.log('Token almacenado:', data.access_token);
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
    document.getElementById('login-Btn').style.display = 'none'; // Ocultar botón de login
    document.getElementById('logout-Btn').style.display = 'block'; // Mostrar botón de logout
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

document.getElementById('search-box').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const query = document.getElementById('search-box').value;
        fetchPhotos(query);
    }
});

function displayPhotos(photos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpia la galería antes de agregar nuevas fotos

    photos.forEach(photo => {
        const photoContainer = document.createElement('div');
        photoContainer.classList.add('photo-container');
        
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description;

        // Crear botón de like
        const likeBtn = document.createElement('button');
        likeBtn.classList.add('like-btn');
        likeBtn.textContent = '💔'; // Ícono de like
        likeBtn.addEventListener('click', () => {
            toggleLike(photo.id, likeBtn); // Añadimos la función de like aquí
        });

        photoContainer.appendChild(img);
        photoContainer.appendChild(likeBtn);
        gallery.appendChild(photoContainer);
    });
}

async function toggleLike(photoId, likeBtn) {
    const token = localStorage.getItem('accessToken');

    // Verificar si ya tiene un like o no (simulado a partir del botón actual)
    const isLiked = likeBtn.classList.contains('liked');

    try {
        const response = await fetch(`https://api.unsplash.com/photos/${photoId}/like`, {
            method: isLiked ? 'DELETE' : 'POST', // Si ya está "liked", hacemos DELETE, si no, POST
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al dar like:', response.statusText, errorData);
            return;
        }

        if (isLiked) {
            likeBtn.classList.remove('liked');
            likeBtn.textContent = '💔'; // Cambia el botón a no-like
            removeLikeFromLocalStorage(photoId);
        } else {
            likeBtn.classList.add('liked');
            likeBtn.textContent = '❤️'; // Cambia el botón a like
            saveLikeFromLocalStorage(photoId);
        }
    } catch (error) {
        console.error('Error en el proceso de like/unlike:', error);
    }
}

document.getElementById('logout-Btn').addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    alert('Has cerrado sesión.');
    document.getElementById('logout-Btn').style.display = 'none'; // Ocultar el botón de logout
    document.getElementById('login-Btn').style.display = 'block'; // Mostrar el botón de login
    window.location.reload(); // Recargar la página para actualizar la vista
});
