'use strict'

const MINE = '💣';
const FLAG = '🚩';

// Model
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
    minesCount: 1
};

// Time
var gStartPointTime;
var gCurrTime;
var gTimeInterval;
var gIsTimePoint;

function initGame() {

    gGame.isOn = true;
    gIsTimePoint = false;
    clearInterval(gTimeInterval);

    gBoard = createBoard();
    renderBoard(gBoard)
}

function createCell(isMine = false, minesAroundCount = 0) {
    return {
        isMine,
        minesAroundCount,
        isShown: false,
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
            board[i][j] = createCell(isMine);
            minesIdx++;
        }
    }
    setMinesNegsCount(board);
    
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
            var isShown = currCell.isShown;
            var contentToShow = currCell.isMine ?
                MINE : currCell.minesAroundCount ? currCell.minesAroundCount : '';
            // Present content or hude it
            contentToShow = isShown ? contentToShow : '';

            var className = currCell.isShown && !contentToShow ? 'reveal-empty' : '';

            strHTML += `<td data-i="${i}" data-j="${j}" 
            oncontextmenu="javascript:rightClick(${i},${j});return false;"
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


// MouseEvent handling 
function rightClick(i, j) {

    getStartTimePoint();
    console.log('right click on', i, j);
}

function cellClicked(elCell, cellI, cellJ) {

    if (!gGame.isOn) return;
    getStartTimePoint();
    
    // Check data
    console.log(elCell);
    // console.log(elCell.dataset);
    // console.log('cellI: ', cellI);
    // console.log('cellJ: ', cellJ);

    var currCell = gBoard[cellI][cellJ]
    if (currCell.isMine) {
        currCell.isShown = true;
        gameOver();
    } else if (currCell.minesAroundCount) {
        currCell.isShown = true;
        isVictory(gBoard);
    } else {
        if (!elCell.classList.contains('reveal-empty')) {
            elCell.classList.add('reveal-empty');
        }
        getNegsExpend(cellI, cellJ, gBoard);
        console.log('Negs view expend on:', cellI, cellJ);
        isVictory(gBoard);
    }

    renderBoard(gBoard);
}

function getNegsExpend(cellI, cellJ, board) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j]
            if (!currCell.isMine) currCell.isShown = true;
        }
    }
}

function getSize(size, minesCount, elBtn) {

    if (!gGame.isOn) return;

    var elSizeBtns = document.querySelectorAll('.level');

    for (var i = 0; i < elSizeBtns.length; i++) {
        if (elSizeBtns[i] === elBtn) elBtn.classList.add('button-clicked');
        else if (elSizeBtns[i].classList.contains('button-clicked')) {
            elSizeBtns[i].classList.remove('button-clicked');
        }
    }
    gLevel.size = size;
    gLevel.minesCount = minesCount;
    initGame();
}

function getTimeDurationView() {

    gCurrTime = Date.now();
    gGame.secsPassed = ((gCurrTime - gStartPointTime) / 1000).toFixed(3);

    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed;
}

function getStartTimePoint() {
    if (!gIsTimePoint) {
        gStartPointTime = Date.now();
        gTimeInterval = setInterval(getTimeDurationView, 100);
        gIsTimePoint = true;
    } else return;
}

function gameOver(isVictory) {

    var smilyIcon = isVictory ? `😎` : `🤯`;
    document.querySelector('.smily-icon').innerText = smilyIcon;
    var msg = isVictory ? `You Won !` : `Game Over`;
    document.querySelector('.msg').innerText = msg;
    clearInterval(gTimeInterval);
    gGame.isOn = false;
    document.querySelector('.game-over-modal').style.display = 'block';
}

function resetGame() {
    
    // For randoom click reset if needed
    gIsTimePoint = false;
    clearInterval(gTimeInterval);
    document.querySelector('.smily-icon').innerHTML = `😃`;

    document.querySelector('.game-over-modal').style.display = 'none';
    initGame();
}

function isVictory(board) {

    var count = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {

            var isCurrCellShown = board[i][j].isShown;
            if (isCurrCellShown) count++;
            if (count === (gLevel.size ** 2 - gLevel.minesCount)) {
                gameOver(true);
                return;
            }
        }
    }
}


