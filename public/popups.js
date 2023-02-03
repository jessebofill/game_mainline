function setPopupString(lookup, character, enemy, maxDur, isResponse) {
    let newText
    let user
    let strings
    let a = "opppnents's"
    let b = 'their'
    let c = 'they'
    if (character.user === 'player1') {
        user = enemy.user === 'cpu' ? 'You' : 'Player 1'
        b = enemy.user === 'cpu' ? 'your' : b
        c = enemy.user === 'cpu' ? 'you' : c
        popup.coords = player1Data.coords.popup
    } else {
        user = character.user === 'cpu' ? 'CPU' : 'Player 2'
        a = character.user === 'cpu' ? 'your' : a
        popup.coords = player2Data.coords.popup
    }

    if (isResponse) {
        strings = {
            miss: 'The attack missed!',
            normalHit: 'It hit normally',
            superLucky: 'It was super lucky hit!',
            lucky: 'It was a lucky hit!',
            heal: user + ' regained some health',
            alreadyFullHp: 'But ' + c + ' were already at full health!',
            alreadyFullAp: "But it wasn't even damaged!",
            patchArmor: "It's defenses were slightly restored",
            brittleArmor: `It's defenses were slightly restored, 
            but it's very brittle!`,
            armorPierce: "It took some damage",
            armorBreak: "It completely broke!",
            alreadyBroken: 'But it was already completely broken!',
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
        gameplayFrameBuffer.push()
        gameplayFrameBuffer.noStroke()
        gameplayFrameBuffer.fill(220)
        if (this.on) gameplayFrameBuffer.text(this.text, this.x, this.y)
        gameplayFrameBuffer.pop()

    }
}