function makeButtonAnimations(){
    let menuButtons = []
    let gButtons = []

    for (let prop in menu) {
        if (menu[prop] instanceof Button){
            menuButtons.push(menu[prop])
        }
    }

    for (let prop in gaugeButtons) {
        if (gaugeButtons[prop] instanceof Button){
            gButtons.push(gaugeButtons[prop])
        }
    }

    for (let button of menuButtons){
        globalAnimations.push(new Animation(button, {y: [[150, 19, 'linear'],[-600, 20, 'linear']]}))
    }

    for (let button of gButtons){
        globalAnimations.push(new Animation(button, {y: [[150, 19, 'linear'],[-400, 20, 'linear']], x: [[0, 19, 'linear'], [-300, 20, 'linear']]}))
    }
}


function initAllButtons(){
    startButton = new Button(200, 250, 200, 100, "Start");
    startButton.onClick(() => { game.isStarted = true; enableAllowedButtons() });

    initMoveButtons()
    initGaugeButtons()
    
    menu.onClickAny(disableButtons)
    gaugeButtons.onClickAny(disableButtons)

    makeButtonAnimations()

    disableButtons()

    
}

function initMoveButtons () {
    menu = new ButtonMan(4, 2, 2, 300, 75, 0, 450, width, 150);

    for (let i = 0; i < 4; i++) {
        menu.rename('button' + i, moveNames[i])
        menu[moveNames[i]].onClick(takeTurn, player, cpu, moveNames[i]);
    }
}

function initGaugeButtons () {
    gaugeButtons = new ButtonMan(3, 3, 1, width / 6, 50, width / 2, 400, width / 2, 50)
    gaugeButtons.rename('button0', 'regenPP', 'PP Up')
    gaugeButtons.rename('button1', 'renewArmor', 'Renew Armor')
    gaugeButtons.rename('button2', 'special')

    gaugeButtons.regenPP.onClick(setPPMoveButtonsVisibility, true)
    gaugeButtons.renewArmor.onClick(takeTurn, player, cpu, 'renewArmor')
    gaugeButtons.special.onClick(takeTurn, player, cpu, 'special')

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
    let allowedGaugeButtons = [];

    for (let move in player.pp) {
        if (player.pp[move].cur) allowedMenuButtons.push(move)
    }
    
    for (let move in player.gpCost) {
        if (player.gp >= player.gpCost[move]) allowedGaugeButtons.push(move)
    }
    
    menu.setProperty('active', true, ...allowedMenuButtons)
    gaugeButtons.setProperty('active', true, ...allowedGaugeButtons)
}

function disableButtons(){
    menu.setProperty("active", false, "all");
    gaugeButtons.setProperty("active", false, "all");
}