function initAllButtons(){
    startButton = new Button(200, 250, 200, 100, "Start");
    startButton.onClick(() => { game.isStarted = true; enableAllowedButtons() });

    initMoveButtons()
    initGuageButtons()
    
    menu.onClickAny(disableButtons)
    guageButtons.onClickAny(disableButtons)

    disableButtons()

    
}

function initMoveButtons () {
    menu = new ButtonMan(4, 2, 2, 300, 75, 0, 450, width, 150);

    for (let i = 0; i < 4; i++) {
        menu.rename('button' + i, moveNames[i])
        menu[moveNames[i]].onClick(takeTurn, player, cpu, moveNames[i]);
    }
}

function initGuageButtons () {
    guageButtons = new ButtonMan(3, 3, 1, width / 6, 50, width / 2, 400, width / 2, 50)
    guageButtons.rename('button0', 'regenPP', 'PP Up')
    guageButtons.rename('button1', 'renewArmor', 'Renew Armor')
    guageButtons.rename('button2', 'special')

    guageButtons.regenPP.onClick(setPPMoveButtonsVisibility, true)
    guageButtons.renewArmor.onClick(takeTurn, player, cpu, 'renewArmor')
    guageButtons.special.onClick(takeTurn, player, cpu, 'special')

    initPPMoveButtons()
}

function initPPMoveButtons(){
    ppMoveButtons = new ButtonMan(4, 1, 4, 80, 25, width / 2 - 80, 350, 80, 100)
    setPPMoveButtonsVisibility(false)

    for (let i = 0; i < 4; i++) {
        ppMoveButtons['button' + i].onClick(() => {
            player.ppUpSelection = moveNames[i]; 
            takeTurn(player, cpu, 'regenPP')
            setPPMoveButtonsVisibility(false);
        })
        ppMoveButtons.rename('button' + i, moveNames[i])
    }

}

function enableAllowedButtons() {
    let allowedMenuButtons = [];
    let allowedGuageButtons = [];

    for (let move in player.pp) {
        if (player.pp[move].cur) allowedMenuButtons.push(move)
    }
    
    for (let move in player.gpCost) {
        if (player.gp >= player.gpCost[move]) allowedGuageButtons.push(move)
    }
    
    menu.setProperty('active', true, ...allowedMenuButtons)
    guageButtons.setProperty('active', true, ...allowedGuageButtons)
}

function disableButtons(){
    menu.setProperty("active", false, "all");
    guageButtons.setProperty("active", false, "all");
}