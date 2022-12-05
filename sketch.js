let player;
let cpu;
let menu;
let gaugeButtons;
let ppMoveButtons;
let startButton;
let slider

let gameGraphics
let gameGraphicsCoords = {y: 0}

let globalAnimations = []
let gameGraphicsAnimation

const game = {
    isStarted: false,
    isFinished: false
}

const popup = {
    textObject: undefined,
    coords: [],
    maxDuration: 3000
}

const playerData = {
    coords: {
        character: [50, 250],
        hpBar: [250, 300],
        gauge: [350, 350],
        popup: [100, 250]
    },
    spritePath: 'pixilart-drawing.png'
}

const cpuData = {
    coords: {
        character: [400, 50],
        hpBar: [50, 100],
        gauge: [150, 150],
        popup: [300, 100]
    },
    spritePath: 'pixilart-drawing.png',
    isTurn: false,
    moveOptions: [0],
    movePreference: ''
}

const moveNames = ['attack', 'heal', 'patchArmor', 'armorPierce']


function setup() {
    //p5 setup
    createCanvas(600, 600);

    gameGraphics = createGraphics(600, 450)
    gameGraphicsAnimation = new Animation(gameGraphicsCoords, {y: [150, 20, 'linear']})

    slider = createSlider(0, 100, 100)
    slider.position(10, 10) 

    //GENERATE CPU MOVES/ SHOW PREFS
    cpuTurnChoices = generateMoveChoices()
    //cpu prefs
    getCpuPrefString();

    //CREATE CHARACTERS
    player = new Character("player", playerData.coords.character[0], playerData.coords.character[1], playerData.spritePath);
    cpu = new Character("cpu", cpuData.coords.character[0], cpuData.coords.character[1], cpuData.spritePath);

    initAllButtons()
}

function moveButtons() {
    for (let animation of globalAnimations){
        animation.play()
    }
}

function draw() {
    background(220);
    gameGraphics.textSize(20)
    //player.ap = slider.value()
    //DISPLAY DURING GAMEPLAY ONLY
    //stuff to show in gameplay loop
    if (game.isStarted) {

        //TAKE CPU TURN
        //check if it's cpu's turn and take turn if it is
        if (cpuData.isTurn) {
            console.log('cputurn')
            cpuData.isTurn = false;
            takeTurn(cpu, player)
        }
        
        
        gameGraphics.background(220);

        //DRAW VISUAL ELEMENTS
        //lets make hp display/ gauge display consistent
        drawHpBar(player, playerData.coords.hpBar[0], playerData.coords.hpBar[1]);
        drawGauge(player, playerData.coords.gauge[0], playerData.coords.gauge[1])
        //drawShield(player, playerData.coords.hpBar[0], playerData.coords.hpBar[1] + 30);
        player.drawCharacter();


        drawHpBar(cpu, cpuData.coords.hpBar[0], cpuData.coords.hpBar[1]);
        drawGauge(cpu, cpuData.coords.gauge[0], cpuData.coords.gauge[1])
        //drawShield(cpu, cpuData.coords.hpBar[0], cpuData.coords.hpBar[1] + 30)
        
        cpu.drawCharacter();

        showMovePP(0, 0)

        showCpuPreference(10, 20)

        popup.textObject?.show()

        image(gameGraphics, 0, gameGraphicsCoords.y)

        // draw buttons
        menu.show();
        gaugeButtons.show()
        ppMoveButtons.show()



        //ANIMATIONS
        player.animate()
        cpu.animate()
        gameGraphicsAnimation.animate()
        for (let animations of globalAnimations) {
            animations.animate()
        }


        //POPUP
        // if(popupText){
        //     popupText.show()
        // }

    } else {
        startButton.show();
    }



    //END GAME
    if (cpu.hp === 0) endGame("You Win!");
    if (player.hp === 0) {
        menu.setProperty("active", false, "all");
        endGame("You Lose!");
    }
}





//CHARACTER MOVE SELECTION/ NEXT CHARACTER TURN
function takeTurn(character, enemy, moveName) {
    //moveName is string of move to use 
    //check if game is over
    if (!game.isFinished) {
        let responsePopup

        //if it's cpu's turn...
        if (character.user == 'cpu') {
            moveName = cpuChooseMove()             //...select random cpu move
            character.endTurn = enableAllowedButtons  //...fn to advance turn toggles player buttons active
        } else {
            character.endTurn = () => {
                moveButtons()
                gameGraphicsAnimation.play()
                //cpuData.isTurn = true 
            }
        }
        //set popup text using moveName then...
        setPopupString(moveName, character, popup.maxDuration)

        responsePopup = (result) => {
            let delayedStrings = {
                normalHit: true,
                superLucky: true,
                lucky: true,
            }

            let delay = delayedStrings[result] ? 1000 : 0;
            console.log(result)

            setTimeout(() => setPopupString(result, character, popup.maxDuration, true), delay)
        }


        //call character class move using moveName
        setTimeout(() => { character.doMove(moveName, responsePopup, enemy) }, 1000)

    }
}


function cpuChooseMove() {
    let moveNum = random(cpuData.moveOptions)
    let move = moveNames[moveNum]

    if (cpu.pp[move] == 0) return cpuChooseMove()
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
    text(cpuData.movePreference, x, y);
}

function setPopupString(lookup, character, maxDur, isResponse) {
    let user
    let enemies
    let newText
    let strings
    if (character.user === 'player') {
        user = 'You'
        enemies = "CPU's"
        popup.coords = playerData.coords.popup

    } else {
        user = 'CPU'
        enemies = 'your'
        popup.coords = cpuData.coords.popup
    }


    if (isResponse) {
        strings = {
            normalHit: 'It hit normally',
            superLucky: 'It was super lucky hit!',
            lucky: 'It was a lucky hit!',
            heal: user + ' regained some health',
            patchArmor: "It's blocking power was slightly restored",
            armorPierce: "It's took some damage",
            regenPP: 'Move PP went up',
            renewArmor: "It's back to original condition",
            special: 'It did massive damage!!!'
        }
    } else {
        strings = {
            attack: user + ' attacked!',
            heal: user + ' healed!',
            patchArmor: user + ' patched their armor',
            armorPierce: user + ' attacked ' + enemies + ' armor',
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
    for (let move in player.pp) {
        let x = menu[move].x + relX
        let y = menu[move].y + relY
        text('' + player.pp[move].cur, x, y)
        //text(player.pp[i].cur + "/" + player.pp[i].max , x, y)
    }
    pop()
}

function regenMovePP(character) {
    if (character.user === 'player') setPPMoveButtonsVisibility(true)
    character.regenPP()
}


//display gauge needs to become a class method
function drawGauge(character, x, y) {
    gameGraphics.push()
    let w = 170
    let h = 16
    gameGraphics.stroke(0)
    gameGraphics.fill(90, 55, 160)
    gameGraphics.rect(x, y, character.gp * w / character.maxgp, h)
    gameGraphics.noFill()
    gameGraphics.rect(x, y, w, h)

    for (let dW = 0; dW < w; dW += w / character.maxgp) {
        gameGraphics.line(x + dW, y, x + dW, y + h)
    }
    gameGraphics.pop()
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

    gameGraphics.push()
    gameGraphics.stroke(0);
    gameGraphics.strokeWeight(2)
    gameGraphics.noFill();
    gameGraphics.rect(x - 1, y - 1, 300 - 2, 20 + 2);
    gameGraphics.fill(r, g, b)
    //fill(40);
    gameGraphics.noStroke();

    gameGraphics.rect(x, y, (character.hp / 100) * 300, 20);
    gameGraphics.pop()
}

function drawShield(character, x, y) {
    gameGraphics.push()
    gameGraphics.stroke(80, 60, 200)
    gameGraphics.strokeWeight(4)
    gameGraphics.line(x, y, x + (character.ap / 100) * 300, y);
    gameGraphics.pop()
}


function endGame(str) {
    game.isFinished = true;
    text(str, 200, 200);
}

function setPPMoveButtonsVisibility(isOn) {
    let visibility = isOn ? 'all' : 'invisible'

    ppMoveButtons.setProperty('active', isOn, 'all')
    ppMoveButtons.setProperty('visibility', visibility, 'all')
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
        if (this.on) gameGraphics.text(this.text, this.x, this.y)
    }
}
