const WebSocket = require('ws')

const server = new WebSocket.Server({ port: 3000 })

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
                socket.send(JSON.stringify({ type: 'error', message: 'lobby not found' }))
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
        const lobby = lobbies[socket.lobbyCode]
        if (!lobby) return

        if (socket.role === 'host' && lobby.guest) {
            lobby.guest.send(JSON.stringify({ type: 'host-disconnected' }))
        }
        if (socket.role === 'guest' && lobby.host) {
            lobby.host.send(JSON.stringify({ type: 'guest-disconnected' }))
        }

        delete lobbies[socket.lobbyCode]
    })
})

console.log('signaling server running on ws://localhost:3000')