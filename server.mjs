import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta 'public'

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html')); // Ajusta la ruta según tu estructura de carpetas
});

app.post('/getAccessToken', async (req, res) => {
    const code = req.body.code;
    const clientId = 'xqUunjlbw48Qr8Aqt1Qf2UiugPkcQQnUBOcH5RE9jYE'; // Reemplaza con tu Access Key
    const clientSecret = 'aby3KTKIcKs6juxGRg5okK5IHsNOOGCy5_frMap8r4c'; // Reemplaza con tu Secret Key
    const redirectUri = 'http://localhost:3000';

    try {
        const response = await fetch('https://unsplash.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                code: code,
                grant_type: 'authorization_code',
            }),
        });

        const data = await response.json();
        console.log('Token recibido:', data.access_token); // Verifica que el token se imprima
        res.json(data);
    } catch (error) {
        console.error('Error al obtener el token:', error);
        res.status(500).json({ error: 'Error obteniendo el token' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});
