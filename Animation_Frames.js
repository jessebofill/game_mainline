let frames = {
    player1: {
        atk: { x: [[-10, 20, 'linear'], [10, 40, 'linear']] },
    },

    player2: {
        atk: { x: [[10, 20, 'linear'], [-10, 40, 'linear']] }

    },
    common: {
        hp: { hp: [100, 50, 'linear'] },
        armor: { ap: [100, 90, 'linear'] }
    }
}


function parseJSON(file_path) {
    let parsedObject
    fetch(file_path)
        .then((file) => {
            console.log(file)
            return file.json()
        })
        .then((jsonString) => {
            console.log('-- > jsonString', jsonString)


            parsedObject = jsonString
        })
    return parsedObject
}
