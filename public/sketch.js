const socket = io()

let player1;
let player2;
let gameplayFrameBuffer
let playerLobby = []
let myID
let opponentID
let room
let initiator = false
let viewLobby = false

let invitation


const gameplayFrameBufferCoords = [0, 0]
const startButtons = []
const moveNames = ['attack', 'heal', 'patchArmor', 'armorPierce']

const gameplayButtons = {
    mainMoves: [],
    gaugeMoves: [],
    ppUps: []
}

const gameplayScreenAnimations = {
    shiftUp: [],
    shiftDown: []
}

const game = {
    isStarted: false,
    isFinished: false,
    isOnline: false
}

const popup = {
    textObject: undefined,
    coords: [],
    maxDuration: 3000
}

const player1Data = {
    coords: {
        character: [50, 250],
        hpBar: [250, 300],
        gauge: [350, 350],
        popup: [250, 280]
    },
    spritePath: 'pixilart-drawing.png'
}

const player2Data = {
    coords: {
        character: [400, 50],
        hpBar: [50, 100],
        gauge: [150, 150],
        popup: [50, 200]
    },
    spritePath: 'pixilart-drawing.png'

}

const cpuData = {
    isTurn: false,
    moveOptions: [3],
    movePreference: ''
}

function goToLobby(){
    deactivateMainMenuButtons()
    viewLobby = true
}

function drawLobby(){
    text('My ID: ' + myID, 100, 100)
    let x = 100
    let y = 200

    // for (let i = 0; i < playerLobby.length; i++) {
    //     text(playerLobby[i], x, y)
    //     y += 50
    // }
    for (let client in playerLobby){
        text(client, x, y)
        playerLobby[client].button.y = y - 20
        playerLobby[client].button.show()
        y += 30
    }
    if (invitation) text('You recieved an invitation from ' + invitation, 50, 500)
}

function setup() {
    setupLobbySocketListeners(socket)
    createCanvas(600, 600);
    gameplayFrameBuffer = createGraphics(600, 450)
    gameplayFrameBuffer.textSize(20)
    createStartButtons()
}

function draw() {
    background(220);
    //DISPLAY DURING GAMEPLAY ONLY
    if (game.isStarted) {
        background('#202020')
        //TAKE CPU TURN
        if (cpuData.isTurn) {
            console.log('cputurn')
            cpuData.isTurn = false;
            takeTurn(player2, player1, cpuChooseMove())
        }
        //DRAW GAMEPLAY SCREEN
        drawGameplayFrame()

        //ANIMATIONS
        player1.animate()
        player2.animate()
        animateGameplayScreen()

        //END GAME
        if (player2.hp === 0) endGame("You Win!");
        if (player1.hp === 0) {
            disableAllButtons()
            endGame("You Lose!");
        }
    } else if (viewLobby){
        drawLobby()
    } else
    {
        drawMainMenu()
    }
}

function takeTurn(character, enemy, moveName) {
    //moveName is string of move to use 
    //check if game is over
    // console.log(character)
    if (!game.isFinished) {

        //emit event with (moveName)
        //on event calls takeTurnProxy(player2, player1, moveName)
        if (game.isOnline && character.user === 'player1') socket.emit('takeTurn', room, moveName)
        let responsePopup
        //set popup text using moveName then...
        setPopupString(moveName, character, enemy, popup.maxDuration)

        responsePopup = (result) => {
            let delayedStrings = {
                normalHit: true,
                superLucky: true,
                lucky: true,
            }

            let delay = delayedStrings[result] ? 1000 : 0;

            setTimeout(() => setPopupString(result, character, enemy, popup.maxDuration, true), delay)
        }
        //call character class move using moveName
        setTimeout(() => { character.doMove(moveName, responsePopup, enemy) }, 1000)
    }
}

function endGame(str) {
    game.isFinished = true;
    text(str, 200, 200);
}

async function parseJSON(path) {
    let parsedObject

    await fetch(path).then((response) => {
        return response.json()
    }).then((object) => {
        parsedObject = object
    })
 
    return parsedObject
} 

async function getPlayerKeyframes(prefix, character){
    const suffix = character.user === 'player1' ? '.json' : '_invert.json'
    return await parseJSON('keyframes/' + prefix + suffix)
}

