'use strict'

const MINE = '💣';
const FLAG = '🚩';

// Model
var gBoard;

var gGame = {
    isOn: false,    // Boolean, when true we let the user play
    shownCount: 0,  // How many cells are shown
    markedCount: 0,  // How many cells are marked (with a flag)
    secsPassed: 0,   // How many seconds passed
}

var gLevel = {
    size: 4,
    minesCount: 2,
    lives: 2
};

// Time
var gStartPointTime;
var gCurrTime;
var gTimeInterval;
var gIsTimePoint;

// Sounds
const audioGameOver = new Audio('sound/game over.wav');
const audioWin = new Audio('sound/win.wav');

function initGame() {

    gGame.isOn = true;
    gIsTimePoint = false;
    clearInterval(gTimeInterval);

    gBoard = createBoard();

    var elLives = document.querySelector('.lives-counter');
    elLives.innerText = '' + gLevel.lives;
    renderBoard(gBoard);
}

function createCell(isMine = false, minesAroundCount = 0) {
    return {
        isMine,
        minesAroundCount,
        isShown: false,
        isMarked: false
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

            var isShown = currCell.isShown && !currCell.isMarked;
            var contentToShow =
                currCell.isMine ?
                    MINE : currCell.minesAroundCount ?
                        currCell.minesAroundCount : '';

            // Present content or hude it
            contentToShow = isShown ? contentToShow : '';
            // Present content or flag on render itarats
            contentToShow = currCell.isMarked ? FLAG : contentToShow;

            var className = isShown ? 'revealed-content' : '';
            var style = renderColorStyle(currCell.minesAroundCount);

            strHTML += `<td data-i="${i}" data-j="${j}" 
            oncontextmenu="javascript:rightClick(this,${i},${j});return false;"
            onclick="cellClicked(this,${i},${j})" 
            style="color: ${style};"
            class="${className}">${contentToShow}</td>`
        }
        strHTML += '</tr>\n'
    }

    var elTable = document.querySelector('.board')
    elTable.innerHTML = strHTML
}

// MouseEvent handling 
function rightClick(elCell, i, j) {
    getStartTimePoint();
    console.log('right click on', i, j);
    markCell(elCell, i, j);
}

function cellClicked(elCell, i, j) {

    // console.log(elCell);
    if (!gGame.isOn) return;
    getStartTimePoint();

    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    if (currCell.isMarked) return;

    if (currCell.isMine) {
        currCell.isShown = true;

        gLevel.lives--;
        var elLives = document.querySelector('.lives-counter');
        elLives.innerText = '' + gLevel.lives;

        if (!gLevel.lives) {
            gameOver();
        }

    } else if (currCell.minesAroundCount) {
        currCell.isShown = true;
        isVictory(gBoard);

    } else {
        currCell.isShown = true;

        getNegsExpend(i, j, gBoard);
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
            if (!currCell.isMine && !gBoard[cellI][cellJ].isMarked) {

                currCell.isShown = true;
                // if (!currCell.minesAroundCount) {

                //     getNegsToExpend(i, j, gBoard);
                // } else continue;
            }
        }
    }
}

function getSize(size, minesCount, lives, elBtn) {

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
    gLevel.lives = lives;
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

function markCell(elCell, i, j) {

    var currCell = gBoard[i][j];

    if (currCell.isShown) return;

    currCell.isMarked = !currCell.isMarked;
    gGame.markedCount = currCell.isMarked ?
        gGame.markedCount + 1 : gGame.markedCount - 1;

    console.log('Cell', i, j, 'has',
        currCell.isMarked ? 'marked' : 'Unmarked');
    renderBoard(gBoard)
}

function gameOver(isVictory) {

    var smilyIcon = isVictory ? `😎` : `🤯`;
    document.querySelector('.smily-icon').innerText = smilyIcon;
    var msg = isVictory ? `You Won !` : `Game Over`;
    document.querySelector('.msg').innerText = msg;
    clearInterval(gTimeInterval);
    gGame.isOn = false;
    isVictory ? audioWin.play() : audioGameOver.play();
    document.querySelector('.game-over-modal').style.display = 'block';
}

function resetGame() {

    gLevel.lives = 2;
    // For randoom click reset if needed
    gIsTimePoint = false;
    clearInterval(gTimeInterval);
    document.querySelector('.timer').innerText = 0;
    document.querySelector('.smily-icon').innerHTML = `😃`;

    document.querySelector('.game-over-modal').style.display = 'none';
    initGame();
}

function isVictory(board) {

    var count = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {

            var isCurrCellShown = board[i][j].isShown;
            if (isCurrCellShown && !board[i][j].isMine) count++;
            if (count === (gLevel.size ** 2 - gLevel.minesCount)) {
                gameOver(true);
                return;
            }
        }
    }
}


