const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'))

let lobby = []
// let rooms = []
io.on('connection', (socket) => {
    lobby.push(socket.id)
    socket.join(socket.id)

    socket.on('disconnect', () => {
        lobby = lobby.filter(id => id !== socket.id)
        io.emit('updateClientList', lobby)
    })
    socket.emit('socketConnect', socket.id)
    io.emit('updateClientList', lobby)

    socket.on('invite', (fromID, toID) => {
        console.log(fromID + ' sent invite to: ' + toID)
        socket.to(toID).emit('invite', fromID)
    })

    socket.on('acceptInvite', (invitee, inviter) => {
        console.log(invitee + ' accepted invitation from: ' + inviter)
        socket.to(inviter).emit('acceptInvite', invitee)
    })
    socket.on('enterRoom', (room, id) => {
        socket.join(room)
        if (io.of("/").adapter.rooms.get(room).size === 2) {
            console.log(id + ' joined room ' + room)
            console.log('starting game in room: ' + room)
            io.to(room).emit('begin')
        } else {
            console.log('creating room: ' + room)
            console.log(id + ' joined room ' + room)
        }
        // console.log(io.of("/").adapter.rooms.get(room).size)
        // socket.join(room)
        // if (!rooms.includes(room)) {
        //     console.log('creating room: ' + room)
        //     console.log(id + ' joined room ' + room)
        //     rooms.push(room)
        // } else {
        //     console.log(id + ' joined room ' + room)
        //     console.log('starting game in room: ' + room)
        //     io.to(room).emit('begin')
        // }
    })

    socket.on('endTurn', room => socket.to(room).emit('endTurn'))


    socket.on('takeTurn', (room, move) => {
        console.log(socket.id + ' is taking turn: ' + move) 
        socket.to(room).emit('takeTurn', move)
    })

    socket.on('sendMoveOutcome', (room, move, outcome) => {
        console.log('received move data from: ' + socket.id)
        console.log('--move: ' + move, outcome)
        console.log('sending data to proxy')
        socket.to(room).emit('doMove', move, outcome)
    })
});



server.listen(3030, () => {
    console.log('listening on *:3030');
});
