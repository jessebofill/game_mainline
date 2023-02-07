function sendInvite(toUser) {
    socket.join(socket.id)
}


function setupLobbySocketListeners(socket) {
    socket.on('updateClientList', (clientList) => {
        const conncetedClients = clientList.filter(id => id !== myID)
        const deleted = []
        const newIDs = []
        for (let id in playerLobby) {
            if (conncetedClients.includes(id)) continue
            else deleted.push(id)
        }
        for (let id of conncetedClients) {
            if (!playerLobby.hasOwnProperty(id)) {
                newIDs.push(id)
            }
        }
        for (let id of deleted) {
            delete playerLobby[id]
        }
        for (let id of newIDs) {
            addLobbyClient(id)
        }
    })
    socket.on('socketConnect', (id) => {
        myID = id
    })
    socket.on('invite', inviter => {
        console.log('received invite from: ', inviter)
        playerLobby[inviter].recievedInvite = true
        playerLobby[inviter].button.label = 'accept'
    })

    socket.on('acceptInvite', acceptedOpponent => {
        console.log(acceptedOpponent + ' accepted your invitation')
        opponentID = acceptedOpponent
        room = myID + acceptedOpponent
        initiator = true
        socket.emit('enterRoom', room, myID)
    })

    socket.on('begin', firstPlayer => {
        console.log('starting game with ' + opponentID)
        if (myID === firstPlayer) {

        }
        startOnlineGame()
    })
    // socket.on('', (m) => console.log("m"))
    // socket.on('updateClients', (id) => console.log(id))
}

function updateClientList(clientList) {
    // playerLobby = lobby.filter(id => id !== myID)
    const conncetedClients = clientList.filter(id => id !== myID)
    const deleted = []
    const newIDs = []
    for (let id in playerLobby) {
        if (conncetedClients.includes(id)) continue
        else deleted.push(id)
    }
    for (let id of conncetedClients) {
        if (!playerLobby.hasOwnProperty(id)) {
            newIDs.push(id)
        }
    }
    for (let id of deleted) {
        delete playerLobby[id]
    }
    for (let id of newIDs) {
        addLobbyClient(id)
    }
}

function removeListeners(socket) {
    socket.removeAllListeners()
}

function addLobbyClient(id) {
    playerLobby[id] = {
        id: id,
        button: new Button(300, -100, 50, 25, 'invite'),
        recievedInvite: false,
        sentInvite: false
    }

    playerLobby[id].button.onClick(() => {
        if (playerLobby[id].recievedInvite) {
            console.log('accepted invite from: ' + id)
            socket.emit('acceptInvite', myID, id)
            room = id + myID
            opponentID = id
            socket.emit('enterRoom', room, myID)
        } else {
            playerLobby[id].button.active = false
            playerLobby[id].button.label = 'invited'
            console.log('sent invite to: ' + id)
            socket.emit('invite', myID, id)
        }
    })
}

function startOnlineGame() {
    removeListeners(socket)
    game.isOnline = true
    deactivateMainMenuButtons()
    createCharacters(true)
    setupGameSocketListeners()
    initGameButtons()
    // player1.endTurn = () => {
    //     console.log('turn finished')
    //     socket.emit('endTurn', room)
    // }
    player2.endTurn = () => enableAllowedButtons(player1)

    if (initiator) enableAllowedButtons(player1)
    game.isStarted = true;
}

function setupGameSocketListeners() {
    socket.on('endTurn', () => {
        console.log('opponent finished turn')
        player2.endTurn()
    })
    socket.on('takeTurn', move => {
        takeTurn(player2, player1, move)
    })
    socket.on('doMove', (move, moveData) => {
        console.log('received data')
        console.log( '--move: ' + move, moveData)
        player2.moveResData = moveData
        player2.resolveMovePromise()
    })
}