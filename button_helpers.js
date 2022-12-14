function initGameButtons(is2player) {
    createMainButtons(player1, player2)
    createGaugeButtons(player1, player2)
    createPPUpButtons(player1, player2)

    if (is2player) {
        createMainButtons(player2, player1)
        createGaugeButtons(player2, player1)
        createPPUpButtons(player2, player1, is2player)
    }

    for (let each in gameplayButtons) {
        for (let buttonMan of gameplayButtons[each]) {
            buttonMan.onClickAny(disableAllButtons)
        }
    }
    disableAllButtons()
}

function createStartButtons() {
    startButtons.push(new Button(200, 200, 200, 100, "Single Player"))
    startButtons.push(new Button(200, 300, 200, 100, "2 Player"))
    startButtons[0].onClick(startGame, 0);
    startButtons[1].onClick(startGame, 1)
}

function createMainButtons(thisPlayer, otherPlayer) {
    let y = thisPlayer.user === 'player1' ? 450 : -205
    let mButtons = new ButtonMan(4, 2, 2, 300, 75, 0, y, width, 150);
    
    mButtons.rename('button0', moveNames[0], 'Attack')
    mButtons.rename('button1', moveNames[1], 'Heal')
    mButtons.rename('button2', moveNames[2], 'Patch Armor')
    mButtons.rename('button3', moveNames[3], 'Armor Pierce')
    for (let i = 0; i < 4; i++) {
        mButtons[moveNames[i]].onClick(takeTurn, thisPlayer, otherPlayer, moveNames[i]);
    }

    // mButtons.setProperty('color', '#a7c4c9', 'all')
    // mButtons.setProperty('textColor', '#455054', 'all')
    // mButtons.setProperty('borderColor', '#455054', 'all')
    // mButtons.setProperty('depressedColor', '#f64668', 'all')
    // mButtons.setProperty('highlightColor', '#308695', 'all')
    // mButtons.setProperty('visibility', 'noBorder', 'all')

    gameplayButtons.mainMoves.push(mButtons)
}

function createGaugeButtons(thisPlayer, otherPlayer) {
    let x = thisPlayer.user === 'player1' ? width / 2 : 0
    let y = thisPlayer.user === 'player1' ? 400 : -55
    let gButtons = new ButtonMan(3, 3, 1, width / 6, 50, x, y, width / 2, 50)
    gButtons.rename('button0', 'regenPP', 'PP Up')
    gButtons.rename('button1', 'renewArmor', 'Renew Armor')
    gButtons.rename('button2', 'special', 'Special')
    gButtons.regenPP.onClick(setPPUpButtonsVisibility, true, thisPlayer)
    gButtons.renewArmor.onClick(takeTurn, thisPlayer, otherPlayer, 'renewArmor')
    gButtons.special.onClick(takeTurn, thisPlayer, otherPlayer, 'special')



    // gButtons.setProperty('color', '#984063', 'all')
    // gButtons.setProperty('textColor', '#fe9677', 'all')
    // gButtons.setProperty('borderColor', '#54283a', 'all')
    // gButtons.setProperty('depressedColor', '#f64668', 'all')
    // gButtons.setProperty('highlightColor', '#54283a', 'all')
    gameplayButtons.gaugeMoves.push(gButtons)
}

function createPPUpButtons(thisPlayer, otherPlayer) {
    let x = thisPlayer.user === 'player1' ? width / 2 - 80 : width / 2
    let y = thisPlayer.user === 'player1' ? 350 : -55
    let pButtons = new ButtonMan(4, 1, 4, 80, 25, x, y, 80, 100)

    for (let i = 0; i < 4; i++) {
        pButtons['button' + i].onClick(() => {
            setPPUpButtonsVisibility(false, thisPlayer);
            thisPlayer.ppUpSelection = moveNames[i];
            takeTurn(thisPlayer, otherPlayer, 'regenPP')
        })
    }
    pButtons.rename('button0', moveNames[0], 'Attack')
    pButtons.rename('button1', moveNames[1], 'Heal')
    pButtons.rename('button2', moveNames[2], 'Patch Armor')
    pButtons.rename('button3', moveNames[3], 'Armor Pierce')
    pButtons.setProperty('textSize', 12, 'all')
    gameplayButtons.ppUps.push(pButtons)

    setPPUpButtonsVisibility(false, thisPlayer)
}

function enableAllowedButtons(player) {
    let playerIndex = player.user === 'player1' ? 0 : 1
    let allowedMoveButtons = [];
    let allowedGaugeButtons = [];

    for (let move in player.pp) {
        if (player.pp[move].cur) allowedMoveButtons.push(move)
    }

    for (let move in player.gpCost) {
        if (player.gp >= player.gpCost[move]) allowedGaugeButtons.push(move)
    }

    gameplayButtons.mainMoves[playerIndex].setProperty('active', true, ...allowedMoveButtons)
    gameplayButtons.gaugeMoves[playerIndex].setProperty('active', true, ...allowedGaugeButtons)
}

function disableAllButtons() {
    for (let each in gameplayButtons) {
        if (each === 'ppUps') continue
        for (let buttonMan of gameplayButtons[each]) {
            buttonMan.setProperty("active", false, "all");
        }
    }
}

function setPPUpButtonsVisibility(isOn, player) {
    let visibility = isOn ? 'all' : 'invisible'
    let playerIndex = player.user === 'player1' ? 0 : 1
    console.log(player.user)
    gameplayButtons.ppUps[playerIndex].setProperty('active', isOn, 'all')
    gameplayButtons.ppUps[playerIndex].setProperty('visibility', visibility, 'all')
}

function showGameplayButtons() {
    for (let each in gameplayButtons) {
        for (let buttonMan of gameplayButtons[each]) {
            buttonMan.show()
        }
    }
}