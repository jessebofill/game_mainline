function cpuChooseMove() {
    //possibility to choose special
    if (player2.gp >= player2.gpCost.special) {
        if (random(100) < 90) {
            return 'special'
        }
    }
    //possibililty to choose renew armor
    if (player2.gp >= player2.gpCost.renewArmor) {
        // percent chances when armor is at [0, 1-25, 26-50, 51-75, 76-100]
        const chances = [90, 80, 50, 20, 5]
        if (random(100) < chances[Math.ceil(player2.ap / 25)]) {
            return 'renewArmor'
        }
    }
    //possibility to choose regenPP
    if (player2.gp >= player2.gpCost.regenPP) {
        let weights = [10, 8, 6, 3, 2, 1]
        let possibililties = []
        for (let move in player2.pp) {
            if (player2.pp[move].cur <= player2.pp[move].max - 5) {
                let weight = weights[player2.pp[move].cur]
                for (let i = 0; i < weight; i++) {
                    possibililties.push(move)
                }
            }
        }
        let prob = player2.hp / 100
        let total = Math.ceil(possibililties.length / (prob))
        let curLength = possibililties.length
        for (let i = 0; i < total - curLength; i++) {
            possibililties.push(false)
        }
        let choice = random(possibililties)
        if (choice) {
            player2.ppUpSelection = choice
            return 'regenPP'
        }
    }

    let healW = (player2.hp < 100 - player2.hl) ? 100 - ((player2.hp * 100) / (100 - player2.hl)) : 0
    let patchW = (player2.ap < 70) ? 100 - ((player2.ap * 100) / (70)) : 0
    let otherW = 100 - ((healW + patchW) / 2)
    let selection = [otherW, healW, patchW, otherW]
    if (player1.ap == 0) {selection[3] = 0}
    let x = random(selection[0] + selection[1] + selection[2] + selection[3])
    let lowerBound = 0
    for (let i = 0; i < selection.length; i++) {
        let upperBound = lowerBound + selection[i]
        if (lowerBound < x && x <= upperBound) {
            if (player2.pp[moveNames[i]].cur == 0) return cpuChooseMove()
            return moveNames[i]
        }
        lowerBound = upperBound
    }

    // let moveNum = random(cpuData.moveOptions)
    // let move = moveNames[moveNum]
    // console.log('cpu chose ' + move)
    // if (player2.pp[move].cur == 0) return cpuChooseMove()
    // return move
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