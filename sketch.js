let player1;
let player2;
let gameplayFrameBuffer

const gameplayFrameBufferCoords =  [0, 0]
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
    isFinished: false
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


function setup() {
    createCanvas(600, 600);
    gameplayFrameBuffer = createGraphics(600, 450)
    gameplayFrameBuffer.textSize(20)
    createStartButtons()
}

function draw() {
    background(220);
    //DISPLAY DURING GAMEPLAY ONLY
    if (game.isStarted) {
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
    } else {
        startButtons[0].show();
        startButtons[1].show();
    }
}

function takeTurn(character, enemy, moveName) {
    //moveName is string of move to use 
    //check if game is over
    console.log(character)
    if (!game.isFinished) {
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
            console.log(result)

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


