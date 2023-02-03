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
    startButtons.push(new Button(200, 400, 200, 100, "Online"))
    startButtons[0].onClick(startGame, 0);
    startButtons[1].onClick(startGame, 1)
    startButtons[2].onClick(goToLobby)
}

function deactivateMainMenuButtons(){
    startButtons[0].active = false
    startButtons[1].active = false
    startButtons[2].active = false
}

function createMainButtons(thisPlayer, otherPlayer) {
    let y = thisPlayer.user === 'player1' ? 450 : -205
    let mButtons = new ButtonMan(4, 2, 2, 300, 75, 0, y, width, 150);
    
    mButtons.rename('button0', moveNames[0], 'Attack')
    mButtons.rename('button1', moveNames[3], 'Armor Pierce')
    mButtons.rename('button2', moveNames[1], 'Heal')
    mButtons.rename('button3', moveNames[2], 'Patch Armor')
    for (let i = 0; i < 4; i++) {
        mButtons[moveNames[i]].onClick(takeTurn, thisPlayer, otherPlayer, moveNames[i]);
    }

    mButtons.setProperty('color', '#b599d7', 'attack', 'heal')
    mButtons.setProperty('highlightColor', '#7f68a0', 'attack', 'heal')
    mButtons.setProperty('borderColor', '#7f68a0', 'attack', 'heal')
    mButtons.setProperty('color', '#13d3bf', 'armorPierce', 'patchArmor')
    mButtons.setProperty('highlightColor', '#0e756c', 'armorPierce', 'patchArmor')
    mButtons.setProperty('borderColor', '#0e756c', 'armorPierce', 'patchArmor')
    mButtons.setProperty('textColor', '#afafaf', 'all')
    mButtons.setProperty('borderWeight', 2, 'all')
    // mButtons.setProperty('borderColor', '#455054', 'all')
    mButtons.setProperty('depressedColor', '#5b5b5b', 'all')
    // mButtons.setProperty('highlightColor', '#7f68a0', 'all')
    mButtons.setProperty('visibility', 'noBorder', 'all')
    
    mButtons.setProperty('textSize', 30, 'all')
    mButtons.setProperty('color', '#2e2e2e', 'all')
    mButtons.setProperty('highlightColor', '#474747', 'all')
    // mButtons.setProperty('borderColor', '#212121', 'all')
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
    gButtons.setProperty('textColor', '#afafaf', 'all')
    // gButtons.setProperty('borderColor', '#54283a', 'all')
    // gButtons.setProperty('depressedColor', '#f64668', 'all')
    // gButtons.setProperty('highlightColor', '#54283a', 'all')

    gButtons.setProperty('visibility', 'noBorder', 'all')

    gButtons.setProperty('color', '#2e2e2e', 'all')
    gButtons.setProperty('highlightColor', '#474747', 'all')
    // gButtons.setProperty('borderColor', '#212121', 'all')

    gameplayButtons.gaugeMoves.push(gButtons)
}

function createPPUpButtons(thisPlayer, otherPlayer) {
    let x = thisPlayer.user === 'player1' ? width / 2 - 80 : width / 2
    let y = thisPlayer.user === 'player1' ? 350 : -55
    let pButtons = new ButtonMan(3, 1, 4, 80, 25, x, y, 80, 100)
    const names = ['attack', 'armorPierce', 'heal']
    for (let i = 0; i < names.length; i++) {
        pButtons['button' + i].onClick(() => {
            setPPUpButtonsVisibility(false, thisPlayer);
            thisPlayer.ppUpSelection = names[i];
            takeTurn(thisPlayer, otherPlayer, 'regenPP')
        })
    }
    pButtons.rename('button0', names[0], 'Attack')
    pButtons.rename('button1', names[1], 'Armor Pierce')
    pButtons.rename('button2', names[2], 'Heal')
    // pButtons.rename('button3', names[3], 'Patch Armor')
    pButtons.setProperty('textSize', 12, 'all')
    gameplayButtons.ppUps.push(pButtons)


    // let playerIndex = player.user === 'player1' ? 0 : 1
    // gameplayButtons.ppUps[playerIndex].setProperty('active', false, 'patchArmor')
    // gameplayButtons.ppUps[playerIndex].setProperty('visibility', 'invisible', 'patchArmor')

    setPPUpButtonsVisibility(false, thisPlayer)
}

function enableAllowedButtons(player) {
    let playerIndex = player.user === 'player1' ? 0 : 1
    let allowedMoveButtons = [];
    let allowedGaugeButtons = [];

    for (let move in player.pp) {
        if (player.pp[move].cur) allowedMoveButtons.push(move)
    }
    allowedMoveButtons.push('patchArmor')

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
    gameplayButtons.ppUps[playerIndex].setProperty('active', isOn, 'attack', 'heal', 'armorPierce')
    gameplayButtons.ppUps[playerIndex].setProperty('visibility', visibility, 'attack', 'heal', 'armorPierce')
}

function showGameplayButtons() {
    for (let each in gameplayButtons) {
        for (let buttonMan of gameplayButtons[each]) {
            buttonMan.show()
        }
    }
}