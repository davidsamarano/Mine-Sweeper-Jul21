'use strict'

const MINE = '💣';
const FLAG = '🚩';

// Model
var gBoard;

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
    firstPos: {},
};

var gBestScors = {
    Beginner: 0,
    Medium: 0,
    Expert: 0
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

    var elLives = document.querySelector('.lives-counter');
    elLives.innerText = '' + gLevel.lives;

    gBoard = setBoard();
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

function setBoard() {

    var board = [];

    for (var i = 0; i < gLevel.size; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCell();
        }
    }
    return board;
}

function updateBoardModel() {

    var minesIdx = 0;
    var mines = getShuffledMines(gLevel.size, gLevel.minesCount, gGame.firstPos);

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            currCell.isMine = mines[minesIdx] === MINE;
            minesIdx++;
        }
    }
    setMinesNegsCount(gBoard);
}


function setMinesNegsCount(board) {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currMinesNegsCount = countNeighbors(i, j, board);
            board[i][j].minesAroundCount = currMinesNegsCount;
        }
    }
}

function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
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
            class="${className}">${contentToShow}</td>`;
        }
        strHTML += '</tr>';
    }
    var elTable = document.querySelector('.board');
    elTable.innerHTML = strHTML;
}

function rightClick(elCell, i, j) {
    getStartTimePoint();
    markCell(elCell, i, j);
}

function cellClicked(elCell, i, j) {

    if (!gGame.isOn) return;
    getStartTimePoint();

    var currCell = gBoard[i][j];

    if (currCell.isShown) return;
    if (currCell.isMarked) return;

    if (gGame.isFirstClick) {
        gGame.isFirstClick = false;
        gGame.firstPos = { i, j };

        updateBoardModel();
    }

    currCell.isShown = true;

    if (currCell.isMine) {
        gLevel.lives--;
        var elLives = document.querySelector('.lives-counter');
        elLives.innerText = '' + gLevel.lives;
        if (!gLevel.lives) {
            gameOver();
        }

    } else if (currCell.minesAroundCount) {
        isVictory(gBoard);

    } else {
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
            if (!currCell.isMine && !currCell.isMarked) {

                if (currCell.isShown) continue;
                else {
                    currCell.isShown = true;
                    if (currCell.minesAroundCount) continue;
                    else getNegsExpend(i, j, board);
                }
            }
        }
    }
}

function getSize(size, minesCount, lives, elBtn) {

    if (!gGame.isOn) return;

    var elSizeBtns = document.querySelectorAll('.level');

    for (var i = 0; i < elSizeBtns.length; i++) {
        if (elSizeBtns[i] === elBtn) elBtn.classList.add('level-clicked');
        else if (elSizeBtns[i].classList.contains('level-clicked')) {
            elSizeBtns[i].classList.remove('level-clicked');
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

    renderBoard(gBoard);
}

function getAllMinesShown() {

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {

            var currCell = gBoard[i][j];
            if (currCell.isShown) continue;
            if (currCell.isMine) currCell.isShown = true;
        }
    }
}

function gameOver(isVictory) {

    clearInterval(gTimeInterval);
    gGame.isOn = false;

    var smilyIcon = ``;
    var msg = ``;
    if (isVictory) {
        audioWin.play();
        smilyIcon = `😎`;
        msg = `You Won !`;
    } else {
        getAllMinesShown();
        audioGameOver.play();
        smilyIcon = `🤯`;
        msg = `Game Over`;
    }
    document.querySelector('.smily-icon').innerText = smilyIcon;
    document.querySelector('.msg').innerText = msg;
    document.querySelector('.game-over-modal').style.display = 'block';
}

function resetGame() {

    gGame.isFirstClick = true;
    gGame.firstPos = {};
    // when level differ than default
    gLevel.lives = gLevel.size === 4 ? 2 : 3;
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


