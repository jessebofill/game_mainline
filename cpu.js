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
    text(cpuData.movePreference, x, y);
}