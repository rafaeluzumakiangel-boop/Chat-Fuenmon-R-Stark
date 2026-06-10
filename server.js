const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Servir los archivos estáticos de la carpeta 'public'
app.use(express.static('public'));

// Lógica de la conexión por chat
io.on('connection', (socket) => {
    console.log('Un trabajador se ha conectado al chat');

    // Escuchar cuando un usuario envía un mensaje
    socket.on('chat message', (data) => {
        // Retransmitir el mensaje a todos los usuarios conectados
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('Un trabajador ha salido del chat');
    });
});

// Iniciar el servidor
http.listen(PORT, () => {
    console.log(`Servidor del chat corriendo en http://localhost:${PORT}`);
});