const WebSocket = require('ws')

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const lobbies = {}

server.on('connection', (socket) => {

    socket.on('message', (raw) => {
        const msg = JSON.parse(raw)

        if (msg.type === 'create-lobby') {
            const code = Math.random().toString(36).slice(2, 7).toUpperCase()
            lobbies[code] = { host: socket, guest: null }
            socket.lobbyCode = code
            socket.role = 'host'
            socket.send(JSON.stringify({ type: 'lobby-created', code }))
        }

        if (msg.type === 'join-lobby') {
            const lobby = lobbies[msg.code]

            if (!lobby) {
                socket.send(JSON.stringify({ type: 'error', message: 'Lobby not found' }))
                return
            }

            if (lobby.guest !== null) {
                socket.send(JSON.stringify({ type: 'error', message: 'Lobby is full!' }))
                return
            }

            lobby.guest = socket
            socket.lobbyCode = msg.code
            socket.role = 'guest'

            lobby.host.send(JSON.stringify({ type: 'guest-joined' }))
            lobby.guest.send(JSON.stringify({ type: 'joined-lobby' }))
        }

        if (msg.type === 'game-state') {
            const lobby = lobbies[socket.lobbyCode]
            if (lobby && lobby.guest) {
                lobby.guest.send(JSON.stringify(msg))
            }
        }

        if (msg.type === 'input') {
            const lobby = lobbies[socket.lobbyCode]
            if (lobby && lobby.host) {
                lobby.host.send(JSON.stringify(msg))
            }
        }
    })

    socket.on('close', () => {
        // If they weren't in a lobby, we don't care
        if (!socket.lobbyCode) return;

        const lobby = lobbies[socket.lobbyCode];
        if (!lobby) return;

        // Tell the other player that their opponent left
        if (socket.role === 'host' && lobby.guest) {
            lobby.guest.send(JSON.stringify({ type: 'opponent-disconnected' }));
        } else if (socket.role === 'guest' && lobby.host) {
            lobby.host.send(JSON.stringify({ type: 'opponent-disconnected' }));
        }

        // Destroy the lobby to free up server memory
        delete lobbies[socket.lobbyCode];
        console.log(`Lobby ${socket.lobbyCode} closed because someone disconnected.`);
    });
})

console.log('signaling server running on ws://localhost:3000')