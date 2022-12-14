function drawGameplayFrame(){
    gameplayFrameBuffer.background('#d4cfc9');

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

    image(gameplayFrameBuffer, gameplayFrameBufferCoords[0], gameplayFrameBufferCoords[1])

    showGameplayButtons()
    showMovePP(0, 0)
}

function animateGameplayScreen() {
    for (let dirs in gameplayScreenAnimations) {
        for (let animation of gameplayScreenAnimations[dirs]) {
            animation.animate()
        }
    }
}

function showMovePP(relX, relY) {
    push()
    textSize(20)
    textAlign(LEFT, TOP)
    for (let i = 0; i < gameplayButtons.mainMoves.length; i++) {
        let player = i ? player2 : player1
        for (let move in player1.pp) {
            let x = gameplayButtons.mainMoves[i][move].x + relX
            let y = gameplayButtons.mainMoves[i][move].y + relY
            text('' + player.pp[move].cur, x, y)
            // text(player.pp[move].cur + "/" + player.pp[move].max, x, y)
        }
    }
    pop()
}

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
