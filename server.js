const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const neonColors = ['#00f3ff', '#ff00ff', '#00ff88', '#ffea00', '#ff3366', '#9d00ff'];
let players = {};

io.on('connection', (socket) => {
    players[socket.id] = {
        x: Math.floor(Math.random() * 400) + 150,
        y: Math.floor(Math.random() * 300) + 150,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        name: `Neon_${socket.id.substring(0, 4)}`
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                x: data.x,
                y: data.y
            });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server Neon berjalan di http://localhost:${PORT}`);
});
