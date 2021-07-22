'use strict'

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            var currCell = mat[i][j]
            if (currCell.isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

// function copyMat(mat) {
//     var newMat = [];
//     for (var i = 0; i < mat.length; i++) {
//         newMat[i] = []
//         // newMat[i] = mat[i].slice();
//         for (var j = 0; j < mat[0].length; j++) {
//             newMat[i][j] = mat[i][j];
//         }
//     }
//     return newMat;
// }

function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getShuffledMines(size, minesCount) {

    var lenght = size ** 2;
    var count = 0;
    var mines = [];
    for (var i = 0; i < lenght; i++) {

        if (count < minesCount) {
            mines.push(MINE);
            count++;
        } else mines.push('');
    }
    var shuffledMines = [];
    for (var i = 0; i < lenght; i++) {
        var currCell = mines.splice(getRandomInt(0, mines.length), 1);
        shuffledMines.push(currCell[0]);
    }
    return shuffledMines;
}

function renderColorStyle(minesAroundCount) {

    switch (minesAroundCount) {
        case 1:
            return `blue`;
        case 2:
            return `green`;
        case 3:
            return `red`;
        case 4:
            return `darkblue`;
        case 5:
            return `rgb(93, 62, 122)`;
        case 6:
            return `blueviolet`;
        case 7:
            return `yellow`;
        case 8:
            return `brown`;
        default:
            return `black`;
    }
}

function renderCell(pos, value) {
    var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`)
    elCell.innerText = value
}

