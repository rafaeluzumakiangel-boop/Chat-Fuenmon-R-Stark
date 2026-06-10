const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const filePath = path.join(__dirname, 'mensajes.txt');

// Servir los archivos estáticos de la carpeta 'public'
app.use(express.static('public'));

// Función para leer los mensajes del archivo de texto
function leerMensajes() {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error leyendo mensajes:", err);
    }
    return [];
}

// Función para guardar los mensajes en el archivo de texto
function guardarMensajes(mensajes) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(mensajes, null, 2), 'utf8');
    } catch (err) {
        console.error("Error guardando mensajes:", err);
    }
}

// Lógica de la conexión por chat
io.on('connection', (socket) => {
    console.log('Un trabajador se ha conectado al chat');

    // Al conectarse un usuario, le enviamos uno por uno los mensajes viejos
    const historial = leerMensajes();
    historial.forEach((data) => {
        socket.emit('chat message', data);
    });

    // Escuchar cuando un usuario envía un nuevo mensaje
    socket.on('chat message', (data) => {
        const mensajes = leerMensajes();
        mensajes.push(data);
        guardarMensajes(mensajes);

        // Retransmitir a todos en tiempo real
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('Un trabajador ha salido del chat');
    });
});

// Iniciar el servidor
http.listen(PORT, () => {
    console.log(`Servidor del chat corriendo en el puerto ${PORT}`);
});