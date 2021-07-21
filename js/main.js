'use strict'

const MINE = '💣';

// var gGameInterval;

var gBoard;

var cell = {
    minesAroundCount: 0,
    isShown: true,
    isMine: false,
    isMarked: true
};
var gGame = {
    isOn: false,    // Boolean, when true we let the user play
    shownCount: 0,  // How many cells are shown
    markedCount: 0,  // How many cells are marked (with a flag)
    secsPassed: 0   // How many seconds passed
}
var gLevel = {
    size: 4,
    minesCount: 2
};


function initGame() {
    gBoard = createBoard();
    renderBoard(gBoard)
    // gGameInterval = setInterval(time, 1000);
}

function createCell(isMine = false, minesAroundCount = 0) {
    return {
        isMine,
        minesAroundCount,
        isShown: true,
        isMarked: true
    };
}

function createBoard() {

    var mines = getShuffledMines(gLevel.size, gLevel.minesCount);
    // Check mines
    // console.log('mines: ', mines);
    var minesIdx = 0;
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.size; j++) {

            var isMine = mines[minesIdx] === MINE;
            // var negsCount = countNeighbors(i, j, board);;
            board[i][j] = createCell(isMine);
            minesIdx++;
        }
    }

    setMinesNegsCount(board);
    // Check board
    // console.log('board: ', board);
    return board;
}

function setMinesNegsCount(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {

            var currMinesNegsCount = countNeighbors(i, j, board);
            // Check counting
            // console.log('currMinesNegsCount: ', i, j, currMinesNegsCount);
            board[i][j].minesAroundCount = currMinesNegsCount;
        }
    }
}

function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {

            var currCell = board[i][j];
            var contentToShow = currCell.isMine ?
                MINE : currCell.minesAroundCount ? currCell.minesAroundCount : '';

            var className = currCell ? 'occupied' : ''

            // strHTML += '\t<td class="' + className + '">' + currCell + '</td>\n'
            strHTML += `<td data-i="${i}" data-j="${j}" 
            onclick="cellClicked(this,${i},${j})" 
            class="${className}">${contentToShow}</td>`
        }
        strHTML += '</tr>\n'
    }
    // Check str
    // console.log(strHTML);

    var elTable = document.querySelector('.board')
    elTable.innerHTML = strHTML

}