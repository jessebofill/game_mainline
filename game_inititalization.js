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

    if (is2player) {
        create2pScreenShiftAnimations()
    } else {
    //cpuData.moveOptions = generateMoveChoices()
    getCpuPrefString();
    }
    game.isStarted = true;
}

function create2pScreenShiftAnimations() {
    function getGroupAnimation(button, buttonGroup, dir) {
        let yShift = dir ? 205 : -205
        let groupAnimations = {
            mainMoves: new Animation(button, { y: [yShift, 20, 'linear'] }),
            gaugeMoves: new Animation(button, { y: [yShift, 20, 'linear'] }),
            ppUps: new Animation(button, { y: [yShift, 20, 'linear'] })
        }
        return groupAnimations[buttonGroup]
    }

    for (let buttonGroup in gameplayButtons) {
        for (let buttonMan of gameplayButtons[buttonGroup]) {
            for (let prop in buttonMan) {
                if (buttonMan[prop] instanceof Button) {
                    gameplayScreenAnimations.shiftUp.push(getGroupAnimation(buttonMan[prop], buttonGroup, false))
                    gameplayScreenAnimations.shiftDown.push(getGroupAnimation(buttonMan[prop], buttonGroup, true))
                }
            }
        }
    }

    gameplayScreenAnimations.shiftDown.push(new Animation(gameplayFrameBufferCoords, { 1: [150, 20, 'linear'] }))
    gameplayScreenAnimations.shiftUp.push(new Animation(gameplayFrameBufferCoords, { 1: [-150, 20, 'linear'] }))
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
