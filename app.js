let currentPlayer = 'X';
let gameMode = '';
let difficulty = '';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let winnerLine = null; // Переменная для линии победы

function chooseBotDifficulty() {
    document.getElementById('difficulty-selection').style.display = 'block';
}

function startGame(mode, level = '') {
    gameMode = mode;
    difficulty = level;
    gameActive = true;
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    document.getElementById('status').textContent = 'Ход игрока X';
    renderBoard();
    document.getElementById('difficulty-selection').style.display = 'none';

    // Убираем линию победы, если она была
    if (winnerLine) {
        winnerLine.remove();
    }
}

function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.textContent = board[i];
        cell.onclick = () => handleCellClick(i);
        if (board[i] === 'X') {
            cell.classList.add('X');
        } else if (board[i] === 'O') {
            cell.classList.add('O');
        }
        boardDiv.appendChild(cell);
    }
}

function handleCellClick(index) {
    if (board[index] !== '' || !gameActive) return;

    board[index] = currentPlayer;
    renderBoard();
    checkWinner();

    if (gameMode === 'bot' && gameActive && currentPlayer === 'X') {
        botMove();
    } else if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('status').textContent = `Ход игрока ${currentPlayer}`;
    }
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of winPatterns) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            document.getElementById('status').textContent = `Игрок ${board[a]} выиграл!`;
            drawWinnerLine(a, b, c);
            return;
        }
    }

    if (!board.includes('')) {
        gameActive = false;
        document.getElementById('status').textContent = 'Ничья!';
    }
}

// Функция для рисования линии победы
function drawWinnerLine(a, b, c) {
    const boardDiv = document.getElementById('board');
    const cells = boardDiv.children;
    winnerLine = document.createElement('div');
    winnerLine.classList.add('win-line');
    boardDiv.appendChild(winnerLine);

    const rectA = cells[a].getBoundingClientRect();
    const rectC = cells[c].getBoundingClientRect();

    // Draw a line from the first to the last cell
    const x1 = rectA.left + rectA.width / 2;
    const y1 = rectA.top + rectA.height / 2;
    const x2 = rectC.left + rectC.width / 2;
    const y2 = rectC.top + rectC.height / 2;

    winnerLine.style.left = `${Math.min(x1, x2)}px`;
    winnerLine.style.top = `${Math.min(y1, y2)}px`;
    winnerLine.style.width = `${Math.abs(x2 - x1)}px`;
    winnerLine.style.height = `${Math.abs(y2 - y1)}px`;
    winnerLine.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
}

function botMove() {
    let move;
    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else if (difficulty === 'hard') {
        move = getBestMove();
    }

    board[move] = 'O';
    renderBoard();
    checkWinner();

    if (gameActive) {
        currentPlayer = 'X';
        document.getElementById('status').textContent = `Ход игрока ${currentPlayer}`;
    }
}

function getRandomMove() {
    const emptyCells = board
        .map((val, index) => val === '' ? index : null)
        .filter(val => val !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getMediumMove() {
    const emptyCells = board
        .map((val, index) => val === '' ? index : null)
        .filter(val => val !== null);

    // Блокируем выигрыш игрока
    for (let i of emptyCells) {
        board[i] = 'O';
        if (checkForWinner('O')) {
            board[i] = '';
            return i;
        }
        board[i] = '';
    }

    // Блокируем возможный выигрыш игрока на следующем ходу
    for (let i of emptyCells) {
        board[i] = 'X';
        if (checkForWinner('X')) {
            board[i] = '';
            return i;
        }
        board[i] = '';
    }

    // Если нет угроз, делаем случайный ход
    return getRandomMove();
}

function getBestMove() {
    // Алгоритм Minimax для сложной сложности
    const emptyCells = board
        .map((val, index) => val === '' ? index : null)
        .filter(val => val !== null);

    let bestScore = -Infinity;
    let move;

    for (let i of emptyCells) {
        board[i] = 'O';
        let score = minimax(board, false);
        board[i] = '';
        if (score > bestScore) {
            bestScore = score;
            move = i;
        }
    }

    return move;
}

function minimax(board, isMaximizing) {
    const winner = checkWinnerForMinimax();
    if (winner === 'O') return 1;
    if (winner === 'X') return -1;
    if (!board.includes('')) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = isMaximizing ? 'O' : 'X';
            let score = minimax(board, !isMaximizing);
            board[i] = '';
            bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }

    return bestScore;
}

function checkWinnerForMinimax() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of winPatterns) {
        if (board[a] === 'O' && board[b] === 'O' && board[c] === 'O') {
            return 'O';
        }
        if (board[a] === 'X' && board[b] === 'X' && board[c] === 'X') {
            return 'X';
        }
    }
    return null;
}

function checkForWinner(player) {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of winPatterns) {
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }

    return false;
}
