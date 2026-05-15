const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();
console.log("Verificando claves:");
console.log("API KEY:", process.env.LIVEKIT_API_KEY ? process.env.LIVEKIT_API_KEY.substring(0, 5) + "..." : "NO CARGADA");
console.log("SECRET:", process.env.LIVEKIT_API_SECRET ? "CARGADO CORRECTAMENTE" : "NO CARGADO");

const app = express();
// Permite que React (corriendo en otro puerto) haga peticiones a este servidor
app.use(cors()); 
app.use(express.json());

// Asegúrate de agregar la palabra 'async' antes de (req, res)
app.post('/api/token', async (req, res) => {
  const { participantName, roomName } = req.body;

  if (!participantName || !roomName) {
    return res.status(400).json({ error: 'Se requiere participantName y roomName' });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
      ttl: '10m',
    }
  );

  at.addGrant({ 
    roomJoin: true, 
    room: roomName, 
    canPublish: true, 
    canSubscribe: true 
  });

  try {
    // CORRECCIÓN: Agregar 'await' porque toJwt() devuelve una Promesa en SDKs modernos
    const tokenString = await at.toJwt(); 
    res.json({ token: tokenString });
  } catch (error) {
    console.error("Error generando token:", error);
    res.status(500).json({ error: 'Error interno del servidor al generar el token' });
  }
});

app.listen(3000, () => {
  console.log('Servidor LiveKit Auth corriendo en el puerto 3000');
});