const gameCards = document.querySelectorAll('.game-card');
const activityScreen = document.getElementById('activityScreen');
const backButton = document.getElementById('backButton');

// Build the shared layout used by each activity.
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

let memoryLevel = 1;

// Show cards and check whether the player finds matching pairs.
function renderMemory() {
  const symbols = ['★', '◆', '●', '♥', '▲', '✿', '☀', '☁'];
  const pairCount = Math.min(3 + memoryLevel, symbols.length);
  const values = symbols.slice(0, pairCount).flatMap((symbol) => [symbol, symbol]);
  const shuffled = values.sort(() => Math.random() - 0.5);
  const cards = shuffled.map((value, index) => {
    return `<button class="memory-card" type="button" data-value="${value}" data-index="${index}">?</button>`;
  }).join('');
  const memoryContent = `
    <p class="memory-level">LEVEL ${memoryLevel}</p>
    <div class="memory-grid">${cards}</div>
    <p class="activity-feedback" id="activityFeedback">Find a pair</p>
  `;
  activityScreen.innerHTML = activityTemplate('Memory Match', `Level ${memoryLevel}: find every matching pair.`, memoryContent);
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

// Open the activity selected on the start screen.
function renderGame(selectedGame) {
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

