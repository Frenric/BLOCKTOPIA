const gameCards = document.querySelectorAll('.game-card');
const activityScreen = document.getElementById('activityScreen');
const backButton = document.getElementById('backButton');

function activityTemplate(title, prompt, content) {
  return `
    <section class="activity-card">
      <p class="activity-kicker">Blocktopia classroom</p>
      <h2>${title}</h2>
      <p class="activity-prompt">${prompt}</p>
      ${content}
    </section>
  `;
}

function createChessBoard() {
  const board = Array(64).fill(null);
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  backRank.forEach((type, index) => {
    board[index] = { type, color: 'black' };
    board[index + 8] = { type: 'p', color: 'black' };
    board[index + 48] = { type: 'p', color: 'white' };
    board[index + 56] = { type, color: 'white' };
  });
  return board;
}

function isChessPathClear(board, from, to, rowStep, columnStep) {
  let row = Math.floor(from / 8) + rowStep;
  let column = (from % 8) + columnStep;
  const targetRow = Math.floor(to / 8);
  const targetColumn = to % 8;
  while (row !== targetRow || column !== targetColumn) {
    if (board[row * 8 + column]) return false;
    row += rowStep;
    column += columnStep;
  }
  return true;
}

function isLegalChessMove(board, from, to) {
  const piece = board[from];
  const target = board[to];
  if (!piece || (target && target.color === piece.color)) return false;

  const rowDelta = Math.floor(to / 8) - Math.floor(from / 8);
  const columnDelta = (to % 8) - (from % 8);
  const rowDistance = Math.abs(rowDelta);
  const columnDistance = Math.abs(columnDelta);

  if (piece.type === 'p') {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    const fromRow = Math.floor(from / 8);
    if (columnDelta === 0 && rowDelta === direction && !target) return true;
    if (columnDelta === 0 && rowDelta === direction * 2 && fromRow === startRow && !target && !board[from + direction * 8]) return true;
    return columnDistance === 1 && rowDelta === direction && Boolean(target);
  }

  if (piece.type === 'n') return (rowDistance === 2 && columnDistance === 1) || (rowDistance === 1 && columnDistance === 2);
  if (piece.type === 'k') return rowDistance <= 1 && columnDistance <= 1;

  const isDiagonal = rowDistance === columnDistance;
  const isStraight = rowDelta === 0 || columnDelta === 0;
  if (piece.type === 'b' && !isDiagonal) return false;
  if (piece.type === 'r' && !isStraight) return false;
  if (piece.type === 'q' && !isDiagonal && !isStraight) return false;

  const rowStep = rowDelta === 0 ? 0 : rowDelta / rowDistance;
  const columnStep = columnDelta === 0 ? 0 : columnDelta / columnDistance;
  return isChessPathClear(board, from, to, rowStep, columnStep);
}

function renderChess() {
  const symbols = {
    white: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    black: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };
  const board = createChessBoard();
  let turn = 'white';
  let selectedIndex = null;
  let message = 'White to move';
  let gameOver = false;

  function drawBoard() {
    const legalTargets = selectedIndex === null ? [] : Array.from({ length: 64 }, (_, index) => isLegalChessMove(board, selectedIndex, index) ? index : null).filter((index) => index !== null);
    const squares = board.map((piece, index) => `<button class="chess-square ${index === selectedIndex ? 'selected' : ''} ${legalTargets.includes(index) ? 'legal' : ''}" type="button" data-square="${index}">${piece ? symbols[piece.color][piece.type] : ''}</button>`).join('');
    activityScreen.innerHTML = activityTemplate('Chess', 'Click a piece, then click a highlighted square to move it.', `<div class="chess-board">${squares}</div><p class="activity-feedback" id="activityFeedback">${message}</p><button class="activity-choice" id="resetChess" type="button">Reset Board</button>`);

    activityScreen.querySelectorAll('.chess-square').forEach((square) => {
      square.addEventListener('click', () => {
        if (gameOver) return;
        const index = Number(square.dataset.square);
        const piece = board[index];
        if (selectedIndex === null) {
          if (piece && piece.color === turn) {
            selectedIndex = index;
            message = `${turn === 'white' ? 'White' : 'Black'} piece selected`;
            drawBoard();
          } else {
            message = `Choose a ${turn} piece`;
            drawBoard();
          }
          return;
        }

        if (piece && piece.color === turn) {
          selectedIndex = index;
          message = `${turn === 'white' ? 'White' : 'Black'} piece selected`;
          drawBoard();
          return;
        }

        if (!isLegalChessMove(board, selectedIndex, index)) {
          message = 'That piece cannot move there';
          drawBoard();
          return;
        }

        const movingPiece = board[selectedIndex];
        const capturedPiece = board[index];
        board[index] = movingPiece;
        board[selectedIndex] = null;
        if (movingPiece.type === 'p' && (index < 8 || index > 55)) movingPiece.type = 'q';
        selectedIndex = null;
        if (capturedPiece && capturedPiece.type === 'k') {
          message = `${turn === 'white' ? 'White' : 'Black'} wins! Reset to play again.`;
          gameOver = true;
        } else {
          turn = turn === 'white' ? 'black' : 'white';
          message = `${turn === 'white' ? 'White' : 'Black'} to move`;
        }
        drawBoard();
      });
    });

    activityScreen.querySelector('#resetChess').addEventListener('click', renderChess);
  }

  drawBoard();
}

function renderLevelQuiz(title, levels) {
  let level = 1;

  function renderLevel() {
    const currentLevel = levels[level - 1];
    const buttons = currentLevel.options.map((option) => `<button class="activity-choice" type="button" data-answer="${option}">${option}</button>`).join('');
    activityScreen.innerHTML = activityTemplate(title, `Level ${level}: ${currentLevel.prompt}`, `<p class="memory-level">LEVEL ${level}</p><div class="activity-actions">${buttons}</div><p class="activity-feedback" id="activityFeedback">Choose an answer</p>`);
    activityScreen.querySelectorAll('.activity-choice').forEach((button) => {
      button.addEventListener('click', () => {
        const feedback = activityScreen.querySelector('#activityFeedback');
        if (button.dataset.answer !== currentLevel.correct) {
          feedback.textContent = 'Not quite. Try again!';
          return;
        }

        activityScreen.querySelectorAll('.activity-choice').forEach((choice) => {
          choice.disabled = true;
        });
        if (level === levels.length) {
          feedback.textContent = 'All levels complete! Excellent work!';
          return;
        }

        feedback.textContent = `Level ${level} complete!`;
        const nextButton = document.createElement('button');
        nextButton.className = 'activity-choice';
        nextButton.type = 'button';
        nextButton.textContent = 'Next Level';
        nextButton.addEventListener('click', () => {
          level += 1;
          renderLevel();
        });
        activityScreen.querySelector('.activity-card').append(nextButton);
      });
    });
  }

  renderLevel();
}

let memoryLevel = 1;

function renderMemory() {
  const symbols = ['★', '◆', '●', '♥', '▲', '✿', '☀', '☁'];
  const pairCount = Math.min(3 + memoryLevel, symbols.length);
  const values = symbols.slice(0, pairCount).flatMap((symbol) => [symbol, symbol]);
  const shuffled = values.sort(() => Math.random() - 0.5);
  activityScreen.innerHTML = activityTemplate('Memory Match', `Level ${memoryLevel}: find every matching pair.`, `<p class="memory-level">LEVEL ${memoryLevel}</p><div class="memory-grid">${shuffled.map((value, index) => `<button class="memory-card" type="button" data-value="${value}" data-index="${index}">?</button>`).join('')}</div><p class="activity-feedback" id="activityFeedback">Find a pair</p>`);
  let firstCard = null;
  let matchedPairs = 0;
  let locked = false;
  activityScreen.querySelectorAll('.memory-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (locked || card.classList.contains('revealed') || card.classList.contains('matched')) return;
      card.textContent = card.dataset.value;
      card.classList.add('revealed');
      if (!firstCard) {
        firstCard = card;
        return;
      }
      if (firstCard.dataset.value === card.dataset.value) {
        firstCard.classList.add('matched');
        card.classList.add('matched');
        matchedPairs += 1;
        firstCard = null;
        if (matchedPairs === pairCount) {
          activityScreen.querySelector('#activityFeedback').textContent = `Level ${memoryLevel} complete!`;
          const nextButton = document.createElement('button');
          nextButton.className = 'activity-choice';
          nextButton.id = 'nextMemoryLevel';
          nextButton.type = 'button';
          nextButton.textContent = 'Next Level';
          nextButton.addEventListener('click', () => {
            memoryLevel += 1;
            renderMemory();
          });
          activityScreen.querySelector('.activity-card').append(nextButton);
        } else {
          activityScreen.querySelector('#activityFeedback').textContent = 'Match found!';
        }
      } else {
        locked = true;
        activityScreen.querySelector('#activityFeedback').textContent = 'Keep looking for a match!';
        const previousCard = firstCard;
        const currentCard = card;
        setTimeout(() => {
          previousCard.classList.remove('revealed');
          currentCard.classList.remove('revealed');
          previousCard.textContent = '?';
          currentCard.textContent = '?';
          firstCard = null;
          locked = false;
        }, 650);
      }
    });
  });
}

function renderGame(selectedGame) {
  if (selectedGame === 'Chess') renderChess();
  if (selectedGame === 'Math Quiz') renderLevelQuiz('Math Quiz', [
    { prompt: 'What is 7 × 8?', options: ['48', '56', '64'], correct: '56' },
    { prompt: 'What is 12 + 19?', options: ['29', '31', '32'], correct: '31' },
    { prompt: 'What is 81 ÷ 9?', options: ['7', '8', '9'], correct: '9' }
  ]);
  if (selectedGame === 'Quiz Bee') renderLevelQuiz('Quiz Bee', [
    { prompt: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter'], correct: 'Mars' },
    { prompt: 'How many days are in a week?', options: ['5', '7', '10'], correct: '7' },
    { prompt: 'What is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific'], correct: 'Pacific' }
  ]);
  if (selectedGame === 'Science Lab') renderLevelQuiz('Science Lab', [
    { prompt: 'What do plants need to make food?', options: ['Sunlight', 'Plastic', 'Sand'], correct: 'Sunlight' },
    { prompt: 'Which state of matter is ice?', options: ['Solid', 'Liquid', 'Gas'], correct: 'Solid' },
    { prompt: 'What force pulls objects toward Earth?', options: ['Gravity', 'Sound', 'Light'], correct: 'Gravity' }
  ]);
  if (selectedGame === 'Spelling') renderLevelQuiz('Spelling', [
    { prompt: 'Which word is spelled correctly?', options: ['Elefant', 'Elephant', 'Eliphant'], correct: 'Elephant' },
    { prompt: 'Which word is spelled correctly?', options: ['Beautiful', 'Beutiful', 'Beautifull'], correct: 'Beautiful' },
    { prompt: 'Which word is spelled correctly?', options: ['Adventure', 'Adventur', 'Adventchure'], correct: 'Adventure' }
  ]);
  if (selectedGame === 'Memory Match') {
    memoryLevel = 1;
    renderMemory();
  }
}

gameCards.forEach((card) => {
  card.addEventListener('click', () => {
    gameCards.forEach((item) => item.classList.toggle('selected', item === card));
    const selectedGame = card.dataset.game;
    renderGame(selectedGame);
    document.body.classList.add('game-started', 'game-ready');
  });
});

backButton.addEventListener('click', () => {
  document.body.classList.remove('game-started', 'game-ready');
  activityScreen.innerHTML = '';
});

