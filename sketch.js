let player1;
let player2
let cpu;
let moveButtons;
let gaugeButtons;
let ppMoveButtons;

let slider


const startButtons = []

const buttons = {
    mainMoves: [],
    gaugeMoves: [],
    ppUps: []
}

let gameplayFrameBuffer
let gameplayFrameBufferY = { y: 0 }

let gameplayScreenAnimations = {
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

const moveNames = ['attack', 'heal', 'patchArmor', 'armorPierce']

function createCharacters(is2player) {
    let player2Type = is2player ? 'player2' : 'cpu'

    //CREATE CHARACTERS
    player1 = new Character("player1", player1Data.coords.character[0], player1Data.coords.character[1], player1Data.spritePath);
    player2 = new Character(player2Type, player2Data.coords.character[0], player2Data.coords.character[1], player2Data.spritePath);
}

function startGame(is2player) {
    startButtons[0].active = false
    startButtons[1].active = false
    createCharacters(is2player)
    initGameButtons(is2player)
    enableAllowedButtons(player1)
    setCharacterEndTurnFNs(player1, player2)
    setCharacterEndTurnFNs(player2, player1)

    if (is2player) create2pScreenShiftAnimations()
    //cpuData.moveOptions = generateMoveChoices()
    getCpuPrefString();

    game.isStarted = true;
}

function create2pScreenShiftAnimations(){
    function getGroupAnimation(button, buttonGroup, dir) {
        let yShift = dir ? 205 : -205
        let groupAnimations = {
            mainMoves: new Animation(button, { y: [yShift, 20, 'linear'] }),
            gaugeMoves: new Animation(button, { y: [yShift, 20, 'linear'] }),
            ppUps: new Animation(button, { y: [yShift, 20, 'linear'] })
        }
        return groupAnimations[buttonGroup]
    }

    for (let buttonGroup in buttons) {
        for (let buttonMan of buttons[buttonGroup]) {
            for (let prop in buttonMan) {
                if (buttonMan[prop] instanceof Button) {
                    gameplayScreenAnimations.shiftUp.push(getGroupAnimation(buttonMan[prop], buttonGroup, false))
                    gameplayScreenAnimations.shiftDown.push(getGroupAnimation(buttonMan[prop], buttonGroup, true))
                }
            }
        }
    }

    gameplayScreenAnimations.shiftDown.push(new Animation(gameplayFrameBufferY, { y: [150, 20, 'linear'] }))
    gameplayScreenAnimations.shiftUp.push(new Animation(gameplayFrameBufferY, { y: [-150, 20, 'linear'] }))
}


function setup() {
    //p5 setup
    createCanvas(600, 600);

    gameplayFrameBuffer = createGraphics(600, 450)


    slider = createSlider(0, 100, 100)
    slider.position(10, 10)


    createStartButtons()
}

function draw() {
    background(220);
    gameplayFrameBuffer.textSize(20)
    //player.ap = slider.value()
    //DISPLAY DURING GAMEPLAY ONLY
    //stuff to show in gameplay loop
    if (game.isStarted) {

        //TAKE CPU TURN
        //check if it's cpu's turn and take turn if it is
        if (cpuData.isTurn) {
            console.log('cputurn')
            cpuData.isTurn = false;
            takeTurn(player2, player1, cpuChooseMove())
        }


        gameplayFrameBuffer.background(220);

        //DRAW VISUAL ELEMENTS
        //lets make hp display/ gauge display consistent
        drawHpBar(player1, player1Data.coords.hpBar[0], player1Data.coords.hpBar[1]);
        drawGauge(player1, player1Data.coords.gauge[0], player1Data.coords.gauge[1])
        //drawShield(player, playerData.coords.hpBar[0], playerData.coords.hpBar[1] + 30);
        player1.drawCharacter();


        drawHpBar(player2, player2Data.coords.hpBar[0], player2Data.coords.hpBar[1]);
        drawGauge(player2, player2Data.coords.gauge[0], player2Data.coords.gauge[1])
        //drawShield(cpu, cpuData.coords.hpBar[0], cpuData.coords.hpBar[1] + 30)

        player2.drawCharacter();


        showCpuPreference(10, 20)

        popup.textObject?.show()

        image(gameplayFrameBuffer, 0, gameplayFrameBufferY.y)

        // draw buttons

        showButtons()
        showMovePP(0, 0)



        //ANIMATIONS
        player1.animate()
        player2.animate()
        animateGameplayScreen()


        //POPUP
        // if(popupText){
        //     popupText.show()
        // }

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

function animateGameplayScreen() {
    for (let dirs in gameplayScreenAnimations) {
        for (let animation of gameplayScreenAnimations[dirs]) {
            animation.animate()
        }
    }
}

function setCharacterEndTurnFNs(character, enemy) {
    character.endTurn = () => {
        if (character.user === 'cpu') {
            enableAllowedButtons(enemy)
            return
        }
        if (enemy.user === 'cpu') {
            cpuData.isTurn = true
            return
        }
        let direction = character.user === 'player1' ? 'shiftDown' : 'shiftUp'
        let animationsDone = []
        for (let animation of gameplayScreenAnimations[direction]) {
            animationsDone.push(animation.play().then())
        }
        Promise.all(animationsDone).then(() => enableAllowedButtons(enemy))
    }
}


//CHARACTER MOVE SELECTION/ NEXT CHARACTER TURN
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


function cpuChooseMove() {
    let moveNum = random(cpuData.moveOptions)
    let move = moveNames[moveNum]
    console.log('cpu chose ' + move)
    //if (player2.pp[move].cur == 0) return cpuChooseMove()
    return move
}


function generateMoveChoices() {
    let moves = []
    for (let need = [true, true, true, true]; need.includes(true);) {
        let rolled = random([0, 1, 2, 3])
        moves.push(rolled)
        need[rolled] = false
    }
    return moves
}

function getCpuPrefString() {

}

function showCpuPreference(x, y) {
    text(player2Data.movePreference, x, y);
}

function setPopupString(lookup, character, enemy, maxDur, isResponse) {
    let newText
    let user
    let strings
    let a = "opppnents's"
    let b = 'their'
    if (character.user === 'player1') {
        user = enemy.user === 'cpu' ? 'You' : 'Player 1'
        b = enemy.user === 'cpu' ? 'your' : b
        popup.coords = player1Data.coords.popup
    } else {
        user = character.user === 'cpu' ? 'CPU' : 'Player 2'
        a = character.user === 'cpu' ? 'your' : a
        popup.coords = player2Data.coords.popup
    }

    if (isResponse) {
        strings = {
            normalHit: 'It hit normally',
            superLucky: 'It was super lucky hit!',
            lucky: 'It was a lucky hit!',
            heal: user + ' regained some health',
            patchArmor: "It's blocking power was slightly restored",
            armorPierce: "It took some damage",
            regenPP: 'Move PP went up',
            renewArmor: "It's back to original condition",
            special: 'It did massive damage!!!'
        }
    } else {
        strings = {
            attack: user + ' attacked!',
            heal: user + ' healed!',
            patchArmor: user + ' patched ' + b + ' armor',
            armorPierce: user + ' attacked ' + a + ' armor',
            regenPP: user + ' regens some PP',
            renewArmor: user + ' got new armor',
            special: user + ' used a secret ancient technique!'
        }
    }

    newText = strings[lookup]
    popup.textObject = new Popup(newText, popup.coords[0], popup.coords[1], maxDur)
}


function showMovePP(relX, relY) {
    push()
    textSize(20)
    textAlign(LEFT, TOP)
    for (let i = 0; i < buttons.mainMoves.length; i++) {
        let player = i ? player2 : player1
        for (let move in player1.pp) {
            let x = buttons.mainMoves[i][move].x + relX
            let y = buttons.mainMoves[i][move].y + relY
            text('' + player.pp[move].cur, x, y)
            // text(player.pp[move].cur + "/" + player.pp[move].max, x, y)
        }
    }
    pop()
}

function regenMovePP(character) {
    if (character.user === 'player') setPPUpButtonsVisibility(true)
    character.regenPP()
}


//display gauge needs to become a class method
function drawGauge(character, x, y) {
    gameplayFrameBuffer.push()
    let w = 170
    let h = 16
    gameplayFrameBuffer.stroke(0)
    gameplayFrameBuffer.fill(90, 55, 160)
    gameplayFrameBuffer.rect(x, y, character.gp * w / character.maxgp, h)
    gameplayFrameBuffer.noFill()
    gameplayFrameBuffer.rect(x, y, w, h)

    for (let dW = 0; dW < w; dW += w / character.maxgp) {
        gameplayFrameBuffer.line(x + dW, y, x + dW, y + h)
    }
    gameplayFrameBuffer.pop()
}

function drawHpBar(character, x, y) {
    let g = 120
    let b = 10
    let r = (110 - character.ap) * 2.55
    g = (70 - character.ap) + g

    if (character.ap == 0) {
        r = 160
        g = 20
        b = 10
    }

    gameplayFrameBuffer.push()
    gameplayFrameBuffer.stroke(0);
    gameplayFrameBuffer.strokeWeight(2)
    gameplayFrameBuffer.noFill();
    gameplayFrameBuffer.rect(x - 1, y - 1, 300 + 2, 20 + 2);
    gameplayFrameBuffer.fill(r, g, b)
    //fill(40);
    gameplayFrameBuffer.noStroke();

    gameplayFrameBuffer.rect(x, y, (character.hp / 100) * 300, 20);
    gameplayFrameBuffer.pop()
}

function drawShield(character, x, y) {
    gameplayFrameBuffer.push()
    gameplayFrameBuffer.stroke(80, 60, 200)
    gameplayFrameBuffer.strokeWeight(4)
    gameplayFrameBuffer.line(x, y, x + (character.ap / 100) * 300, y);
    gameplayFrameBuffer.pop()
}


function endGame(str) {
    game.isFinished = true;
    text(str, 200, 200);
}




class Popup {
    constructor(text, x, y, dur) {
        this.on = true;
        this.x = x;
        this.y = y;
        this.text = text;
        this.dur = dur;
        setTimeout(() => this.on = false, this.dur);
    }
    show() {
        if (this.on) gameplayFrameBuffer.text(this.text, this.x, this.y)
    }
}
